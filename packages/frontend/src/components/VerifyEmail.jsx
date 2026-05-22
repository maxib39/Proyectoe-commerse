import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Verificando tu correo electrónico...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró el token de verificación en la URL.');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await fetch(`http://localhost:3002/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Correo verificado correctamente.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al verificar el correo.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Error al conectar con el servidor para la verificación.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', textAlign: 'center', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Verificación de Cuenta</h2>
      <p>{message}</p>
      
      {status === 'success' && (
        <div style={{ marginTop: '20px' }}>
          <Link to="/login" style={{ padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
            Ir a Iniciar Sesión
          </Link>
        </div>
      )}
      
      {status === 'error' && (
        <div style={{ marginTop: '20px' }}>
          <Link to="/register" style={{ color: '#008CBA' }}>
            Volver a Registro
          </Link>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;
