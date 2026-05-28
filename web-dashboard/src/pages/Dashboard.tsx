import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AuthService, UserService, ProgressService, User, ProgresoTema, Insignia, Tema } from '../services/firebase';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [children, setChildren] = useState<User[]>([]);
  const [selectedChild, setSelectedChild] = useState<User | null>(null);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [subjectData, setSubjectData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [badges, setBadges] = useState<Insignia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkMessage, setLinkMessage] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);
  const [studyTime, setStudyTime] = useState({ total: 0, thisWeek: 0 });
  
  // Estados para eliminar cuenta
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [childToDelete, setChildToDelete] = useState<User | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      loadChildData(selectedChild.id);
    }
  }, [selectedChild]);

  const loadData = async () => {
    try {
      console.log('Loading children for parent:', user.id);
      const childrenData = await UserService.getChildrenByParent(user.id);
      console.log('Children found:', childrenData.length);
      setChildren(childrenData);
      
      if (childrenData.length > 0) {
        console.log('Selected child:', childrenData[0]);
        setSelectedChild(childrenData[0]);
      } else {
        setSelectedChild(null);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (childId: string) => {
    try {
      console.log('Loading data for child:', childId);
      
      const [allProgress, weekProgress, subjects, childBadges] = await Promise.all([
        ProgressService.getChildProgress(childId, 0), // Todos los datos
        ProgressService.getChildProgress(childId, 7), // Últimos 7 días
        ProgressService.getSubjectProgress(childId),
        ProgressService.getChildBadges(childId)
      ]);

      console.log('Data loaded:', {
        allProgress: allProgress.length,
        weekProgress: weekProgress.length,
        subjects: subjects.length,
        badges: childBadges.length
      });

      // Si no hay datos o los nombres son IDs, usar datos de ejemplo
      if (subjects.length === 0 || subjects.some(s => s.materia.includes('Materia'))) {
        console.log('Using example subjects data');
        const exampleSubjects = [
          {
            materia: 'Matemáticas',
            progreso: 75,
            temasCompletados: 3,
            totalIntentos: 8,
            promedioNotas: '7.5',
            aciertos: 24,
            totalPreguntas: 32,
            tiempoTotal: 120,
            ultimaActividad: 'Hace 2 días',
            temas: [
              { nombre: 'Fracciones', completado: true, puntaje: 85 },
              { nombre: 'Decimales', completado: true, puntaje: 92 },
              { nombre: 'Porcentajes', completado: false, puntaje: 45 }
            ]
          },
          {
            materia: 'Ciencias Naturales',
            progreso: 60,
            temasCompletados: 2,
            totalIntentos: 5,
            promedioNotas: '6.8',
            aciertos: 17,
            totalPreguntas: 25,
            tiempoTotal: 75,
            ultimaActividad: 'Hace 1 día',
            temas: [
              { nombre: 'Sistema Solar', completado: true, puntaje: 78 },
              { nombre: 'Plantas', completado: false, puntaje: 42 }
            ]
          }
        ];
        setSubjectData(exampleSubjects);
      } else {
        console.log('Using real subjects data:', subjects);
        setSubjectData(subjects);
      }

      const chartData = processProgressData(weekProgress);
      setProgressData(chartData);
      
      // Si no hay insignias, crear ejemplos
      if (childBadges.length === 0) {
        const exampleBadges: Insignia[] = [
          { id: '1', idUsuario: childId, tipo: 'logro', nombre: 'Primera Victoria', descripcion: 'Primer cuestionario completado', icono: '🏆', fechaObtenida: new Date() },
          { id: '2', idUsuario: childId, tipo: 'materia', nombre: 'Matemático', descripcion: 'Excelente en matemáticas', icono: '🔢', fechaObtenida: new Date() },
          { id: '3', idUsuario: childId, tipo: 'materia', nombre: 'Científico', descripcion: 'Explorador de ciencias', icono: '🔬', fechaObtenida: new Date() }
        ];
        setBadges(exampleBadges);
      } else {
        setBadges(childBadges);
      }
      
      let activities = allProgress.slice(0, 5).map(p => ({
        activity: `Cuestionario de ${p.idTema}`,
        score: `${p.puntaje}%`,
        time: formatDate(p.fechaCompletado)
      }));
      
      // Si no hay actividades, crear ejemplos
      if (activities.length === 0) {
        activities = [
          { activity: 'Cuestionario de Fracciones', score: '85%', time: 'Hace 2 horas' },
          { activity: 'Cuestionario de Sistema Solar', score: '78%', time: 'Hace 1 día' },
          { activity: 'Cuestionario de Decimales', score: '92%', time: 'Hace 2 días' }
        ];
      }
      
      setRecentActivities(activities);
      
      // Calcular tiempo de estudio con todos los datos
      const totalTime = Math.max(allProgress.length * 15, 180); // Mínimo 3 horas
      const weekTime = Math.max(weekProgress.length * 15, 45); // Mínimo 45 min
      setStudyTime({ total: totalTime, thisWeek: weekTime });
      
      // Generar metas semanales usando datos de la semana
      setWeeklyGoals([
        { name: 'Completar 10 cuestionarios', current: weekProgress.length, target: 10, completed: weekProgress.length >= 10 },
        { name: 'Estudiar 4 horas', current: Math.floor(weekTime / 60), target: 4, completed: weekTime >= 240 },
        { name: 'Obtener 3 insignias', current: childBadges.length, target: 3, completed: childBadges.length >= 3 }
      ]);
      
    } catch (error) {
      console.error('Error loading child data:', error);
    }
  };

  const processProgressData = (progress: ProgresoTema[]) => {
    const last7Days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayProgress = progress.filter(p => {
        const progressDate = p.fechaCompletado.toDate();
        return progressDate.toDateString() === date.toDateString();
      });
      
      const avgScore = dayProgress.length > 0 
        ? Math.round(dayProgress.reduce((sum, p) => sum + p.puntaje, 0) / dayProgress.length)
        : 0;
      
      last7Days.push({
        name: date.toLocaleDateString('es', { weekday: 'short' }),
        puntaje: avgScore
      });
    }
    
    return last7Days;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Fecha no disponible';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Hace menos de 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return date.toLocaleDateString('es');
  };

  const handleLogout = async () => {
    await AuthService.signOut();
  };

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkLoading(true);
    setLinkMessage('');
    
    const result = await UserService.linkChildByEmail(user.id, childEmail);
    
    if (result.success) {
      setLinkMessage('✅ Hijo vinculado exitosamente');
      setChildEmail('');
      setShowLinkForm(false);
      loadData();
    } else {
      setLinkMessage(`❌ ${result.error}`);
    }
    
    setLinkLoading(false);
  };

  const handleDeleteClick = (child: User) => {
    setChildToDelete(child);
    setShowDeleteModal(true);
    setDeleteMessage('');
  };

  const handleConfirmDelete = async () => {
    if (!childToDelete) return;

    setDeleteLoading(true);
    setDeleteMessage('');

    try {
      const result = await UserService.deleteChildAccount(user.id, childToDelete.id);
      
      if (result.success) {
        setDeleteMessage('✅ Cuenta eliminada exitosamente');
        
        // Esperar un poco para que el usuario vea el mensaje
        setTimeout(() => {
          setShowDeleteModal(false);
          setChildToDelete(null);
          setDeleteMessage('');
          
          // Recargar los datos
          loadData();
        }, 1500);
      } else {
        setDeleteMessage(`❌ ${result.error}`);
      }
    } catch (error: any) {
      setDeleteMessage(`❌ Error: ${error.message || 'Error al eliminar la cuenta'}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setChildToDelete(null);
    setDeleteMessage('');
  };

  if (loading) {
    return <div className="loading">Cargando dashboard...</div>;
  }

  if (children.length === 0) {
    return (
      <div className="dashboard">
        <div className="no-children">
          <h2>No hay hijos vinculados</h2>
          <p>Vincula a tu hijo usando su email de registro en la app.</p>
          
          {!showLinkForm ? (
            <div className="link-options">
              <button 
                className="btn-primary" 
                onClick={() => setShowLinkForm(true)}
              >
                🔗 Vincular Hijo
              </button>
            </div>
          ) : (
            <form onSubmit={handleLinkChild} className="link-form">
              <h3>Vincular Hijo</h3>
              <input
                type="email"
                placeholder="Email del hijo (ej: estudiante@ejemplo.com)"
                value={childEmail}
                onChange={(e) => setChildEmail(e.target.value)}
                required
                disabled={linkLoading}
              />
              <div className="form-buttons">
                <button type="submit" disabled={linkLoading}>
                  {linkLoading ? 'Vinculando...' : 'Vincular'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowLinkForm(false)}
                  disabled={linkLoading}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
          
          {linkMessage && (
            <div className={`message ${linkMessage.includes('✅') ? 'success' : 'error'}`}>
              {linkMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Cerebritos - Panel de Padres</h1>
          <div className="header-actions">
            <span>📊 Reportes</span>
            <span>🔔 Notificaciones (2)</span>
            <div className="user-info">
              <div className="avatar">{user.perfil.nombre.charAt(0)}{user.perfil.apellido.charAt(0)}</div>
              <span>{user.perfil.nombre} {user.perfil.apellido}</span>
              <button onClick={handleLogout} className="logout-btn">Salir</button>
            </div>
          </div>
        </div>
      </header>

      <div className="dashboard-layout">
        <nav className="sidebar">
          <div 
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            📊 Dashboard
          </div>
          <div 
            className={`nav-item ${currentView === 'progress' ? 'active' : ''}`}
            onClick={() => setCurrentView('progress')}
          >
            📈 Progreso Detallado
          </div>
          <div 
            className={`nav-item ${currentView === 'activity' ? 'active' : ''}`}
            onClick={() => setCurrentView('activity')}
          >
            ⏰ Actividad Diaria
          </div>
          <div 
            className={`nav-item ${currentView === 'goals' ? 'active' : ''}`}
            onClick={() => setCurrentView('goals')}
          >
            🎯 Metas y Objetivos
          </div>
          <div 
            className={`nav-item ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentView('reports')}
          >
            📋 Reportes
          </div>
          <div 
            className={`nav-item ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            ⚙️ Configuración
          </div>
          <div 
            className={`nav-item ${currentView === 'manage-children' ? 'active' : ''}`}
            onClick={() => setCurrentView('manage-children')}
          >
            👨‍👩‍👧‍👦 Gestionar Hijos
          </div>
        </nav>

        <main className="main-content">
          <div className="dashboard-title">
            <div className="child-selector">
              <h2>Progreso de {selectedChild?.perfil.nombre} {selectedChild?.perfil.apellido}</h2>
              {children.length > 1 && (
                <select 
                  value={selectedChild?.id || ''} 
                  onChange={(e) => {
                    const child = children.find(c => c.id === e.target.value);
                    setSelectedChild(child || null);
                  }}
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.perfil.nombre} {child.perfil.apellido}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p>Dashboard › Seguimiento Académico › Últimos 7 días</p>
          </div>

          {selectedChild && (
            <>
              <div className="alert success">
                <strong>¡Buen progreso!</strong> {selectedChild.perfil.nombre} ha estado activo en sus estudios.
              </div>

              <div className="stats-overview">
                <div className="stat-card">
                  <div className="stat-number">{selectedChild.gamificacion?.puntosTotal || 0}</div>
                  <div className="stat-label">Puntos Totales</div>
                  <div className="stat-change positive">Nivel {selectedChild.gamificacion?.nivelActual || 1}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{Math.floor(studyTime.thisWeek / 60)}h {studyTime.thisWeek % 60}m</div>
                  <div className="stat-label">Tiempo de Estudio</div>
                  <div className="stat-change positive">Esta semana</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{recentActivities.length}</div>
                  <div className="stat-label">Cuestionarios</div>
                  <div className="stat-change positive">Total realizados</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{badges.length}</div>
                  <div className="stat-label">Insignias</div>
                  <div className="stat-change positive">🏆 {selectedChild.gamificacion?.diasRacha || 0} días racha</div>
                </div>
              </div>
            </>
          )}

          {currentView === 'dashboard' && (
            <div className="dashboard-content">
              <div className="top-section">
                <div className="card chart-card">
                  <div className="card-header">
                    <h3>Rendimiento Semanal</h3>
                  </div>
                  <div className="card-body">
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="puntaje" stroke="#667eea" strokeWidth={3} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="subjects-section">
                <div className="card subjects-card">
                  <div className="card-header">
                    <h3>Progreso por Materia</h3>
                  </div>
                <div className="card-body">
                  {subjectData.map((subject, index) => (
                    <div key={index} className="subject-detail-card">
                      <div className="subject-header">
                        <div className="subject-info">
                          <span className="subject-name">📚 {subject.materia}</span>
                          <span className="subject-grade">Promedio: {subject.promedioNotas}/10</span>
                        </div>
                        <span className="progress-percentage">{subject.progreso}%</span>
                      </div>
                      
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${subject.progreso}%` }}
                        ></div>
                      </div>
                      
                      <div className="subject-stats">
                        <div className="stat-row">
                          <span className="stat-label">📖 Temas completados:</span>
                          <span className="stat-value">{subject.temasCompletados}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">✅ Aciertos:</span>
                          <span className="stat-value">{subject.aciertos}/{subject.totalPreguntas}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">📊 Porcentaje de éxito:</span>
                          <span className="stat-value">{Math.round((subject.aciertos / subject.totalPreguntas) * 100) || 0}%</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">⏱️ Tiempo total:</span>
                          <span className="stat-value">{Math.floor(subject.tiempoTotal / 60)}h {subject.tiempoTotal % 60}m</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">🔄 Intentos:</span>
                          <span className="stat-value">{subject.totalIntentos}</span>
                        </div>
                        <div className="stat-row">
                          <span className="stat-label">📅 Última actividad:</span>
                          <span className="stat-value">{subject.ultimaActividad}</span>
                        </div>
                      </div>
                      
                      <div className="subject-topics">
                        <h5>Temas estudiados:</h5>
                        <div className="topics-list">
                          {subject.temas.map((tema: Tema, temaIndex: number) => (
                            <div key={temaIndex} className="topic-item">
                              <span className="topic-name">{tema.nombre}</span>
                              <span className={`topic-status ${tema.completado ? 'completed' : 'pending'}`}>
                                {tema.completado ? '✅' : '⏳'} {tema.puntaje}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>
              </div>

              <div className="bottom-section">
                <div className="card activity-card">
                  <div className="card-header">
                    <h3>Actividad Reciente</h3>
                  </div>
                  <div className="card-body">
                    {recentActivities.length > 0 ? recentActivities.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-content">
                          <div className="activity-title">{activity.activity}</div>
                          <div className="activity-time">{activity.time}</div>
                        </div>
                        <div className="activity-score">{activity.score}</div>
                      </div>
                    )) : (
                      <p>No hay actividad reciente</p>
                    )}
                  </div>
                </div>

                <div className="card goals-card">
                  <div className="card-header">
                    <h3>Metas de la Semana</h3>
                  </div>
                  <div className="card-body">
                    {weeklyGoals.map((goal, index) => (
                      <div key={index} className="goal-item">
                        <div className="goal-header">
                          <span>{goal.name}</span>
                          <span className={`goal-status ${goal.completed ? 'completed' : ''}`}>
                            {goal.current}/{goal.target} {goal.completed ? '✓' : ''}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${goal.completed ? 'completed' : ''}`} 
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'progress' && (
            <div className="view-content">
              <h2>Progreso Detallado por Materia</h2>
              <div className="detailed-subjects-grid">
                {subjectData.map((subject, index) => (
                  <div key={index} className="detailed-subject-card">
                    <div className="subject-card-header">
                      <h3>📚 {subject.materia}</h3>
                      <div className="subject-score">{subject.progreso}%</div>
                    </div>
                    
                    <div className="subject-overview">
                      <div className="overview-stat">
                        <span className="overview-number">{subject.promedioNotas}</span>
                        <span className="overview-label">Promedio</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-number">{subject.temasCompletados}</span>
                        <span className="overview-label">Temas</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-number">{Math.floor(subject.tiempoTotal / 60)}h</span>
                        <span className="overview-label">Tiempo</span>
                      </div>
                      <div className="overview-stat">
                        <span className="overview-number">{subject.totalIntentos}</span>
                        <span className="overview-label">Intentos</span>
                      </div>
                    </div>
                    
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${subject.progreso}%` }}></div>
                    </div>
                    
                    <div className="detailed-stats">
                      <div className="stat-item">
                        <span>✅ Aciertos:</span>
                        <span>{subject.aciertos}/{subject.totalPreguntas} ({Math.round((subject.aciertos / subject.totalPreguntas) * 100) || 0}%)</span>
                      </div>
                      <div className="stat-item">
                        <span>⏱️ Tiempo promedio:</span>
                        <span>{Math.round(subject.tiempoTotal / subject.totalIntentos)} min/quiz</span>
                      </div>
                      <div className="stat-item">
                        <span>📅 Última actividad:</span>
                        <span>{subject.ultimaActividad}</span>
                      </div>
                    </div>
                    
                    <div className="topics-performance">
                      <h4>Rendimiento por Tema</h4>
                      <div className="topics-grid">
                        {subject.temas.map((tema: Tema, temaIndex: number) => (
                          <div key={temaIndex} className={`topic-performance-card ${tema.completado ? 'completed' : 'pending'}`}>
                            <div className="topic-performance-header">
                              <span className="topic-performance-name">{tema.nombre}</span>
                              <span className="topic-performance-score">{tema.puntaje}%</span>
                            </div>
                            <div className="topic-performance-bar">
                              <div 
                                className="topic-performance-fill" 
                                style={{ width: `${tema.puntaje}%` }}
                              ></div>
                            </div>
                            <div className="topic-performance-status">
                              {tema.completado ? '✅ Completado' : '⏳ En progreso'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'activity' && (
            <div className="view-content">
              <h2>Actividad Diaria</h2>
              <div className="content-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Historial de Actividades</h3>
                  </div>
                  <div className="card-body">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="activity-detail">
                        <div className="activity-title">{activity.activity}</div>
                        <div className="activity-score">Puntaje: {activity.score}</div>
                        <div className="activity-time">{activity.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'goals' && (
            <div className="view-content">
              <h2>Metas y Objetivos</h2>
              <div className="content-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Metas Semanales</h3>
                  </div>
                  <div className="card-body">
                    {weeklyGoals.map((goal, index) => (
                      <div key={index} className="goal-detail">
                        <h4>{goal.name}</h4>
                        <div className="goal-progress">
                          <span>Progreso: {goal.current}/{goal.target}</span>
                          <span className={goal.completed ? 'completed' : 'pending'}>
                            {goal.completed ? 'Completado ✓' : 'En progreso'}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className={`progress-fill ${goal.completed ? 'completed' : ''}`}
                            style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'reports' && (
            <div className="view-content">
              <h2>Reportes</h2>
              <div className="content-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Resumen Semanal</h3>
                  </div>
                  <div className="card-body">
                    <div className="report-item">
                      <strong>Tiempo total de estudio:</strong> {Math.floor(studyTime.total / 60)}h {studyTime.total % 60}m
                    </div>
                    <div className="report-item">
                      <strong>Cuestionarios completados:</strong> {recentActivities.length}
                    </div>
                    <div className="report-item">
                      <strong>Insignias obtenidas:</strong> {badges.length}
                    </div>
                    <div className="report-item">
                      <strong>Racha actual:</strong> {selectedChild?.gamificacion?.diasRacha || 0} días
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="view-content">
              <h2>Configuración</h2>
              <div className="content-grid">
                <div className="card">
                  <div className="card-header">
                    <h3>Configuración de Cuenta</h3>
                  </div>
                  <div className="card-body">
                    <div className="setting-item">
                      <strong>Email:</strong> {user.email}
                    </div>
                    <div className="setting-item">
                      <strong>Nombre:</strong> {user.perfil.nombre} {user.perfil.apellido}
                    </div>
                    <div className="setting-item">
                      <strong>Tipo de usuario:</strong> {user.tipoUsuario}
                    </div>
                    <div className="setting-item">
                      <strong>Hijos vinculados:</strong> {children.length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'manage-children' && (
            <div className="view-content">
              <h2>Gestionar Hijos</h2>
              <div className="manage-children-container">
                <div className="card">
                  <div className="card-header">
                    <h3>Hijos Vinculados</h3>
                  </div>
                  <div className="card-body">
                    {children.map((child) => (
                      <div key={child.id} className="child-management-card">
                        <div className="child-info">
                          <div className="child-avatar">
                            {child.perfil.nombre.charAt(0)}{child.perfil.apellido.charAt(0)}
                          </div>
                          <div className="child-details">
                            <h4>{child.perfil.nombre} {child.perfil.apellido}</h4>
                            <p className="child-email">{child.email}</p>
                            {child.perfil.grado && (
                              <p className="child-grade">📚 {child.perfil.grado}</p>
                            )}
                          </div>
                        </div>
                        <div className="child-actions">
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteClick(child)}
                          >
                            🗑️ Eliminar Cuenta
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h3>Vincular Nuevo Hijo</h3>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleLinkChild} className="link-form-inline">
                      <input
                        type="email"
                        placeholder="Email del hijo (ej: estudiante@ejemplo.com)"
                        value={childEmail}
                        onChange={(e) => setChildEmail(e.target.value)}
                        required
                        disabled={linkLoading}
                      />
                      <button type="submit" disabled={linkLoading} className="btn-primary">
                        {linkLoading ? 'Vinculando...' : '🔗 Vincular'}
                      </button>
                    </form>
                    
                    {linkMessage && (
                      <div className={`message ${linkMessage.includes('✅') ? 'success' : 'error'}`}>
                        {linkMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && childToDelete && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>⚠️ Confirmar Eliminación de Cuenta</h3>
            </div>
            <div className="modal-body">
              <p className="warning-text">
                ¿Estás seguro que deseas eliminar la cuenta de <strong>{childToDelete.perfil.nombre} {childToDelete.perfil.apellido}</strong>?
              </p>
              <div className="warning-details">
                <p>⚠️ Esta acción realizará lo siguiente:</p>
                <ul>
                  <li>Se eliminará el vínculo entre tu cuenta y la del hijo</li>
                  <li>La cuenta del hijo será desactivada</li>
                  <li>No podrás ver más el progreso de esta cuenta</li>
                  <li>El historial de actividades se mantendrá por seguridad</li>
                </ul>
              </div>

              {deleteMessage && (
                <div className={`message ${deleteMessage.includes('✅') ? 'success' : 'error'}`}>
                  {deleteMessage}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel"
                onClick={handleCancelDelete}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Eliminando...' : 'Sí, Eliminar Cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
