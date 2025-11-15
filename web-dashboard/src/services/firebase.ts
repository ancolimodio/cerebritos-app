import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, doc, getDoc, orderBy, limit, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBWUirrft8b_q0KYypYSfq0_khv2D00NDY",
  authDomain: "cerebritos-app.firebaseapp.com",
  projectId: "cerebritos-app",
  storageBucket: "cerebritos-app.firebasestorage.app",
  messagingSenderId: "277846906359",
  appId: "1:277846906359:web:45b1e3858c48d76a118af2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export interface User {
  id: string;
  email: string;
  perfil: {
    nombre: string;
    apellido: string;
    grado?: string;
  };
  tipoUsuario: 'estudiante' | 'padre';
  gamificacion?: {
    puntosTotal: number;
    nivelActual: number;
    diasRacha: number;
  };
}

export interface ProgresoTema {
  id: string;
  idUsuario: string;
  idMateria: string;
  idTema: string;
  puntaje: number;
  puntosObtenidos: number;
  fechaCompletado: any;
  completado: boolean;
}

export interface Insignia {
  id: string;
  idUsuario: string;
  tipo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  fechaObtenida: any;
}

export interface Tema {
  nombre: string;
  completado: boolean;
  puntaje: number;
  fecha: any;
}

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static async signUp(email: string, password: string, userData: any) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Crear perfil en Firestore
      await addDoc(collection(db, 'usuarios'), {
        ...userData,
        email,
        fechaCreacion: new Date(),
        activo: true
      });
      
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static onAuthStateChanged(callback: (user: any) => void) {
    return onAuthStateChanged(auth, callback);
  }
}

export class UserService {
  static async getUserData(userId: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'usuarios', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as User;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  static async getChildrenByParent(parentId: string): Promise<User[]> {
    try {
      const vinculosQuery = query(
        collection(db, 'vinculosPadreHijo'),
        where('idPadre', '==', parentId)
      );
      
      const vinculosSnapshot = await getDocs(vinculosQuery);
      const children: User[] = [];
      
      for (const vinculoDoc of vinculosSnapshot.docs) {
        const vinculo = vinculoDoc.data();
        const childData = await this.getUserData(vinculo.idHijo);
        if (childData) {
          children.push(childData);
        }
      }
      
      return children;
    } catch (error) {
      console.error('Error getting children:', error);
      return [];
    }
  }

  static async linkChildByEmail(parentId: string, childEmail: string) {
    try {
      // Buscar hijo por email
      const childQuery = query(
        collection(db, 'usuarios'),
        where('email', '==', childEmail),
        where('tipoUsuario', '==', 'estudiante')
      );
      
      const childSnapshot = await getDocs(childQuery);
      
      if (childSnapshot.empty) {
        return { success: false, error: 'No se encontró un estudiante con ese email' };
      }
      
      const childDoc = childSnapshot.docs[0];
      const childId = childDoc.id;
      
      // Verificar si ya existe un vínculo con este padre
      const existingLinkQuery = query(
        collection(db, 'vinculosPadreHijo'),
        where('idHijo', '==', childId),
        where('idPadre', '==', parentId),
        where('estado', '==', 'activo')
      );
      
      const existingSnapshot = await getDocs(existingLinkQuery);
      
      if (!existingSnapshot.empty) {
        return { success: false, error: 'Este estudiante ya está vinculado a tu cuenta' };
      }
      
      // Crear nuevo vínculo
      await addDoc(collection(db, 'vinculosPadreHijo'), {
        idPadre: parentId,
        idHijo: childId,
        estado: 'activo',
        fechaVinculacion: new Date(),
        codigoVinculo: Math.random().toString(36).substring(2, 8).toUpperCase()
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Error linking child:', error);
      return { success: false, error: error.message };
    }
  }

  static async createSampleChild(parentId: string) {
    try {
      // Crear usuario hijo de ejemplo
      const childRef = await addDoc(collection(db, 'usuarios'), {
        email: `hijo${Date.now()}@ejemplo.com`,
        perfil: {
          nombre: 'Ana',
          apellido: 'Ejemplo',
          grado: '5to Grado'
        },
        tipoUsuario: 'estudiante',
        fechaCreacion: new Date(),
        activo: true,
        gamificacion: {
          puntosTotal: 150,
          nivelActual: 2,
          insignias: [],
          diasRacha: 3
        }
      });

      // Crear vínculo
      await addDoc(collection(db, 'vinculosPadreHijo'), {
        idPadre: parentId,
        idHijo: childRef.id,
        estado: 'activo',
        fechaVinculacion: new Date(),
        codigoVinculo: Math.random().toString(36).substring(2, 8).toUpperCase()
      });

      // Crear algunos datos de progreso
      const progressData = [
        { tema: 'fracciones', puntaje: 85, materia: 'matematicas' },
        { tema: 'decimales', puntaje: 92, materia: 'matematicas' },
        { tema: 'sistema solar', puntaje: 78, materia: 'ciencias' }
      ];

      for (const progress of progressData) {
        await addDoc(collection(db, 'progresoTemas'), {
          idUsuario: childRef.id,
          idMateria: progress.materia,
          idTema: progress.tema,
          puntaje: progress.puntaje,
          puntosObtenidos: Math.floor(progress.puntaje / 10),
          fechaCompletado: new Date(),
          completado: progress.puntaje >= 70
        });
      }

      return { success: true, childId: childRef.id };
    } catch (error: any) {
      console.error('Error creating sample child:', error);
      return { success: false, error: error.message };
    }
  }
}

export class ProgressService {
  static async getChildProgress(childId: string, days: number = 7): Promise<ProgresoTema[]> {
    try {
      const progressQuery = query(
        collection(db, 'progresoTemas'),
        where('idUsuario', '==', childId)
      );
      
      const snapshot = await getDocs(progressQuery);
      let allProgress = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProgresoTema));
      
      if (days > 0) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        allProgress = allProgress.filter(p => {
          const progressDate = p.fechaCompletado.toDate ? p.fechaCompletado.toDate() : new Date(p.fechaCompletado);
          return progressDate >= startDate;
        });
      }
      
      return allProgress.sort((a, b) => {
        const dateA = a.fechaCompletado.toDate ? a.fechaCompletado.toDate() : new Date(a.fechaCompletado);
        const dateB = b.fechaCompletado.toDate ? b.fechaCompletado.toDate() : new Date(b.fechaCompletado);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error getting progress:', error);
      return [];
    }
  }

  static async getChildBadges(childId: string): Promise<Insignia[]> {
    try {
      const badgesQuery = query(
        collection(db, 'insignias'),
        where('idUsuario', '==', childId)
      );
      
      const snapshot = await getDocs(badgesQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Insignia));
    } catch (error) {
      console.error('Error getting badges:', error);
      return [];
    }
  }

  static async getSubjectProgress(childId: string): Promise<any[]> {
    try {
      const progressData = await this.getChildProgress(childId, 0); // 0 = todos los datos
      
      // Agrupar por materia con estadísticas detalladas
      const subjectStats: { [key: string]: { 
        total: number; 
        correct: number; 
        topics: Map<string, any>;
        totalScore: number;
        totalTime: number;
        totalQuestions: number;
        correctAnswers: number;
        lastActivity: Date | null;
      } } = {};
      
      progressData.forEach(progress => {
        if (!subjectStats[progress.idMateria]) {
          subjectStats[progress.idMateria] = { 
            total: 0, 
            correct: 0, 
            topics: new Map(),
            totalScore: 0,
            totalTime: 0,
            totalQuestions: 0,
            correctAnswers: 0,
            lastActivity: null
          };
        }
        
        const stats = subjectStats[progress.idMateria];
        stats.total++;
        stats.totalScore += progress.puntaje;
        stats.totalTime += 15; // 15 minutos promedio por quiz
        stats.totalQuestions += 10; // 10 preguntas promedio por quiz
        stats.correctAnswers += Math.round((progress.puntaje / 100) * 10);
        
        if (progress.completado) {
          stats.correct++;
        }
        
        // Actualizar información del tema
        const topicKey = progress.idTema;
        if (!stats.topics.has(topicKey)) {
          // Mapear nombres de temas comunes
          const temaNames: { [key: string]: string } = {
            'fracciones': 'Fracciones',
            'decimales': 'Decimales',
            'porcentajes': 'Porcentajes',
            'geometria': 'Geometría',
            'algebra': 'Álgebra',
            'sistema_solar': 'Sistema Solar',
            'plantas': 'Las Plantas',
            'animales': 'Los Animales',
            'cuerpo_humano': 'Cuerpo Humano',
            'estados_materia': 'Estados de la Materia'
          };
          
          const nombreTema = temaNames[topicKey.toLowerCase()] || 
                            topicKey.charAt(0).toUpperCase() + topicKey.slice(1).replace(/([A-Z_])/g, ' $1').replace(/_/g, ' ');
          
          stats.topics.set(topicKey, {
            nombre: nombreTema,
            completado: progress.completado,
            puntaje: progress.puntaje,
            fecha: progress.fechaCompletado
          });
        } else {
          // Actualizar con el mejor puntaje
          const existingTopic = stats.topics.get(topicKey);
          if (progress.puntaje > existingTopic.puntaje) {
            existingTopic.puntaje = progress.puntaje;
            existingTopic.completado = progress.completado;
            existingTopic.fecha = progress.fechaCompletado;
          }
        }
        
        // Actualizar última actividad
        const activityDate = progress.fechaCompletado.toDate ? progress.fechaCompletado.toDate() : new Date(progress.fechaCompletado);
        if (!stats.lastActivity || activityDate > stats.lastActivity) {
          stats.lastActivity = activityDate;
        }
      });
      
      return Object.entries(subjectStats).map(([materiaId, stats]) => {
        console.log('Processing materia:', materiaId, 'Stats:', stats);
        
        const promedioNotas = stats.total > 0 ? (stats.totalScore / stats.total) / 10 : 0;
        const ultimaActividad = stats.lastActivity ? this.formatRelativeDate(stats.lastActivity) : 'Sin actividad';
        
        // Mapear ID de materia a nombre legible
        const materiaNames: { [key: string]: string } = {
          'matematicas': 'Matemáticas',
          'ciencias': 'Ciencias Naturales',
          'lenguaje': 'Lengua y Literatura',
          'historia': 'Historia',
          'geografia': 'Geografía',
          'ingles': 'Inglés',
          'arte': 'Educación Artística',
          'educacion_fisica': 'Educación Física'
        };
        
        // Si el ID parece ser un hash, usar nombre genérico basado en índice
        let nombreMateria;
        if (materiaId.length > 15 || /^[a-zA-Z0-9]{15,}$/.test(materiaId)) {
          const materiaIndex = Object.keys(subjectStats).indexOf(materiaId);
          const defaultNames = ['Matemáticas', 'Ciencias', 'Lengua', 'Historia', 'Geografía'];
          nombreMateria = defaultNames[materiaIndex] || `Materia ${materiaIndex + 1}`;
        } else {
          nombreMateria = materiaNames[materiaId.toLowerCase()] || 
                         materiaId.charAt(0).toUpperCase() + materiaId.slice(1).replace(/([A-Z_])/g, ' $1').replace(/_/g, ' ');
        }
        
        console.log('Final materia name:', nombreMateria);
        
        return {
          materia: nombreMateria,
          progreso: Math.round((stats.correct / stats.total) * 100) || 0,
          temasCompletados: stats.topics.size,
          totalIntentos: stats.total,
          promedioNotas: promedioNotas.toFixed(1),
          aciertos: stats.correctAnswers,
          totalPreguntas: stats.totalQuestions,
          tiempoTotal: stats.totalTime,
          ultimaActividad,
          temas: Array.from(stats.topics.values()).sort((a, b) => b.puntaje - a.puntaje)
        };
      });
    } catch (error) {
      console.error('Error getting subject progress:', error);
      return [];
    }
  }
  
  static formatRelativeDate(date: Date): string {
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffHours < 48) return 'Ayer';
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es');
  }
}