import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { OpenAI } from 'openai';
import * as cors from 'cors';

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

// Inicializar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-test-key',
});

// Función para generar cuestionarios con IA
export const generateQuiz = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      
      const { temaId, dificultad, cantidadPreguntas = 5 } = req.body;

      if (!temaId) {
        return res.status(400).json({ error: 'temaId es requerido' });
      }

      // Obtener información del tema
      const temaDoc = await db.collection('temas').doc(temaId).get();
      let temaNombre = temaId;
      
      if (temaDoc.exists) {
        temaNombre = temaDoc.data()?.nombre || temaId;
      }

      const prompt = createQuizPrompt(temaNombre, dificultad, cantidadPreguntas);

      try {
        // Generar cuestionario con OpenAI
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente educativo especializado en crear cuestionarios para estudiantes de primaria y secundaria. Responde siempre en formato JSON válido.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        });

        const quizData = JSON.parse(completion.choices[0].message.content || '{}');

        // Guardar cuestionario en Firestore
        const cuestionarioRef = await db.collection('cuestionarios').add({
          idTema: temaId,
          titulo: `Cuestionario de ${temaNombre}`,
          dificultad,
          preguntas: quizData.preguntas,
          totalPreguntas: quizData.preguntas.length,
          puntosTotal: quizData.preguntas.reduce((sum: number, p: any) => sum + (p.puntos || 10), 0),
          tiempoLimite: 300,
          generadoPor: 'ia',
          promptIA: prompt,
          fechaCreacion: admin.firestore.FieldValue.serverTimestamp(),
          activo: true,
        });

        return res.json({
          success: true,
          cuestionarioId: cuestionarioRef.id,
          ...quizData,
        });
      } catch (openaiError) {
        console.error('OpenAI Error:', openaiError);
        
        // Fallback a preguntas predefinidas
        const fallbackQuiz = getFallbackQuestions(temaNombre, cantidadPreguntas);
        return res.json({
          success: true,
          source: 'fallback',
          ...fallbackQuiz,
        });
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Función para generar retroalimentación personalizada
export const generateFeedback = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      
      const { tema, puntaje, respuestasIncorrectas } = req.body;

      const prompt = `
Genera retroalimentación educativa personalizada para un estudiante que completó un cuestionario de ${tema}.

Puntaje obtenido: ${puntaje}%
Respuestas incorrectas: ${respuestasIncorrectas.join(', ')}

Proporciona:
1. Un mensaje motivacional apropiado para el puntaje
2. Explicación breve de los conceptos que necesita reforzar
3. Sugerencia del próximo tema a estudiar
4. Consejo de estudio específico

Responde en formato JSON:
{
  "mensaje": "mensaje motivacional",
  "conceptosReforzar": ["concepto1", "concepto2"],
  "proximoTema": "nombre del tema",
  "consejoEstudio": "consejo específico"
}
`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un tutor educativo especializado en dar retroalimentación constructiva a estudiantes.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 500,
        });

        const feedback = JSON.parse(completion.choices[0].message.content || '{}');
        return res.json({ success: true, feedback });
      } catch (openaiError) {
        console.error('OpenAI Feedback Error:', openaiError);
        
        // Fallback feedback
        const fallbackFeedback = generateFallbackFeedback(puntaje, tema);
        return res.json({ success: true, feedback: fallbackFeedback, source: 'fallback' });
      }
    } catch (error) {
      console.error('Error generating feedback:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Función para adaptar dificultad con IA
export const adaptDifficulty = functions.https.onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { userId, historialRespuestas, temaActual } = req.body;

      const prompt = `
Analiza el historial de respuestas de un estudiante y recomienda el nivel de dificultad para el próximo cuestionario.

Tema actual: ${temaActual}
Historial reciente: ${JSON.stringify(historialRespuestas)}

Basándote en el patrón de respuestas, recomienda:
1. Nivel de dificultad (facil, medio, dificil)
2. Tipo de preguntas a enfatizar
3. Conceptos específicos a reforzar

Responde en JSON:
{
  "dificultadRecomendada": "medio",
  "tiposPreguntas": ["opcion_multiple", "verdadero_falso"],
  "conceptosEnfoque": ["concepto1", "concepto2"],
  "razonamiento": "explicación de la recomendación"
}
`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'Eres un sistema de aprendizaje adaptativo que analiza el progreso del estudiante.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 400,
        });

        const adaptacion = JSON.parse(completion.choices[0].message.content || '{}');
        
        // Guardar recomendación en Firestore
        await db.collection('aprendizajeAdaptativo').doc(userId).set({
          ultimaAdaptacion: adaptacion,
          fechaActualizacion: admin.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });

        return res.json({ success: true, adaptacion });
      } catch (openaiError) {
        console.error('OpenAI Adaptation Error:', openaiError);
        
        // Fallback adaptation
        const fallbackAdaptacion = generateFallbackAdaptation(historialRespuestas);
        return res.json({ success: true, adaptacion: fallbackAdaptacion, source: 'fallback' });
      }
    } catch (error) {
      console.error('Error adapting difficulty:', error);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Función auxiliar para crear prompt de cuestionario
function createQuizPrompt(tema: string, dificultad: string, cantidadPreguntas: number): string {
  return `
Crea un cuestionario de ${cantidadPreguntas} preguntas sobre el tema "${tema}" con las siguientes características:

- Tema: ${tema}
- Dificultad: ${dificultad}
- Nivel educativo: Primaria/Secundaria
- Tipos de preguntas: opción múltiple y verdadero/falso

Genera preguntas variadas y apropiadas para estudiantes. Cada pregunta debe tener:
- Una pregunta clara y educativa
- 4 opciones de respuesta para opción múltiple
- La respuesta correcta claramente identificada
- Una explicación educativa de por qué es correcta

Responde ÚNICAMENTE con un JSON válido en este formato:
{
  "preguntas": [
    {
      "id": "1",
      "tipo": "opcion_multiple",
      "pregunta": "¿Cuál es...?",
      "opciones": ["A", "B", "C", "D"],
      "correcta": 1,
      "explicacion": "Explicación clara y educativa",
      "puntos": 10,
      "dificultad": 5
    }
  ]
}
`;
}

// Funciones de fallback
function getFallbackQuestions(tema: string, cantidad: number) {
  const fallbackQuestions = {
    'Fracciones': [
      {
        id: '1',
        tipo: 'opcion_multiple',
        pregunta: '¿Cuál es el resultado de 1/2 + 1/4?',
        opciones: ['1/6', '3/4', '2/6', '1/3'],
        correcta: 1,
        explicacion: 'Para sumar fracciones, necesitamos el mismo denominador. 1/2 = 2/4, entonces 2/4 + 1/4 = 3/4',
        puntos: 10,
        dificultad: 5
      }
    ],
    'Decimales': [
      {
        id: '1',
        tipo: 'opcion_multiple',
        pregunta: '¿Cuál es el resultado de 0.5 + 0.25?',
        opciones: ['0.30', '0.75', '0.55', '1.25'],
        correcta: 1,
        explicacion: 'Al sumar decimales, alineamos los puntos decimales: 0.5 + 0.25 = 0.75',
        puntos: 10,
        dificultad: 4
      }
    ],
    'Sistema Solar': [
      {
        id: '1',
        tipo: 'opcion_multiple',
        pregunta: '¿Cuál es el planeta más cercano al Sol?',
        opciones: ['Venus', 'Mercurio', 'Tierra', 'Marte'],
        correcta: 1,
        explicacion: 'Mercurio es el planeta más cercano al Sol, a una distancia promedio de 58 millones de kilómetros',
        puntos: 10,
        dificultad: 3
      }
    ]
  };

  const questions = fallbackQuestions[tema as keyof typeof fallbackQuestions] || fallbackQuestions['Fracciones'];
  return {
    preguntas: questions.slice(0, cantidad)
  };
}

function generateFallbackFeedback(puntaje: number, tema: string) {
  if (puntaje >= 80) {
    return {
      mensaje: `¡Excelente trabajo en ${tema}! Dominas muy bien este tema.`,
      conceptosReforzar: [],
      proximoTema: 'Siguiente nivel',
      consejoEstudio: 'Continúa practicando para mantener tu nivel.'
    };
  } else {
    return {
      mensaje: `Buen intento en ${tema}. Con un poco más de práctica lo dominarás.`,
      conceptosReforzar: ['Conceptos básicos', 'Ejercicios de práctica'],
      proximoTema: 'Repaso de fundamentos',
      consejoEstudio: 'Dedica 15 minutos diarios a repasar los conceptos básicos.'
    };
  }
}

function generateFallbackAdaptation(historial: any[]) {
  const promedioAciertos = historial.reduce((sum, h) => sum + h.porcentaje, 0) / historial.length;
  
  if (promedioAciertos >= 80) {
    return {
      dificultadRecomendada: 'dificil',
      tiposPreguntas: ['opcion_multiple', 'completar'],
      conceptosEnfoque: ['Conceptos avanzados'],
      razonamiento: 'El estudiante muestra dominio, puede avanzar a mayor dificultad.'
    };
  } else if (promedioAciertos >= 60) {
    return {
      dificultadRecomendada: 'medio',
      tiposPreguntas: ['opcion_multiple', 'verdadero_falso'],
      conceptosEnfoque: ['Refuerzo de conceptos'],
      razonamiento: 'Mantener nivel actual con refuerzo en áreas específicas.'
    };
  } else {
    return {
      dificultadRecomendada: 'facil',
      tiposPreguntas: ['verdadero_falso', 'opcion_multiple'],
      conceptosEnfoque: ['Conceptos fundamentales'],
      razonamiento: 'Necesita reforzar conceptos básicos antes de avanzar.'
    };
  }
}