import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Catalog from './components/Catalog'
import AddManga from './components/AddManga'
import BuyVolumes from './components/BuyVolumes'
import Login from './components/Login'
import Register from './components/Register'
import VerifyEmail from './components/VerifyEmail'
import './App.css'

// Extraemos la NavBar a un componente para poder usar el hook useAuth
function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isVendedor = user && user.rol === 'VENDEDOR';

  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between' }}>
      <div>
        <Link to="/" className="nav-link">Catálogo</Link>
        {isVendedor && (
          <>
            <Link to="/add" className="nav-link">Agregar Manga</Link>
            <Link to="/buy" className="nav-link">Comprar Volúmenes (Stock)</Link>
          </>
        )}
      </div>
      <div>
        {user ? (
          <>
            <span style={{ color: 'white', marginRight: '15px' }}>Hola, {user.username} ({user.rol})</span>
            <button onClick={handleLogout} style={{ cursor: 'pointer', background: 'transparent', color: 'white', border: '1px solid white', padding: '5px 10px', borderRadius: '4px' }}>Cerrar Sesión</button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Iniciar Sesión</Link>
            <Link to="/register" className="nav-link">Registrarse</Link>
          </>
        )}
      </div>
    </nav>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '444821259766-4ago5nilpj194q1ckmiih5salbmqt7br.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <Router>
          <div>
            <NavBar />
            
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route 
                path="/add" 
                element={
                  <ProtectedRoute allowedRoles={['VENDEDOR']}>
                    <AddManga />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/buy" 
                element={
                  <ProtectedRoute allowedRoles={['VENDEDOR']}>
                    <BuyVolumes />
                  </ProtectedRoute>
                } 
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify" element={<VerifyEmail />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}

export default App
