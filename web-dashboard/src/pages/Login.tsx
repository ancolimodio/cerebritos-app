import React, { useState } from 'react';
import { AuthService } from '../services/firebase';

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (isRegister) {
      const userData = {
        perfil: {
          nombre: nombre.trim(),
          apellido: apellido.trim()
        },
        tipoUsuario: 'padre'
      };
      const result = await AuthService.signUp(email, password, userData);
      
      if (!result.success) {
        setError(result.error || 'Error al crear cuenta');
      }
    } else {
      const result = await AuthService.signIn(email, password);
      
      if (!result.success) {
        setError(result.error || 'Error al iniciar sesión');
      }
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">🎯</div>
          <h1>Cerebritos</h1>
          <p>{isRegister ? 'Crear Cuenta - Panel de Padres' : 'Panel de Padres'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {isRegister && (
            <>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Tu apellido"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="padre@email.com"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? 
              (isRegister ? 'Creando cuenta...' : 'Iniciando sesión...') : 
              (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')
            }
          </button>
          
          <div className="login-footer">
            <button 
              type="button" 
              className="toggle-mode"
              onClick={() => setIsRegister(!isRegister)}
              disabled={loading}
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;