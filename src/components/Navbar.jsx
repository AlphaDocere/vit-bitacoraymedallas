import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, ArrowRight } from 'lucide-react';
import LogoLight from '../assets/Kreative vit sin fondo letra negra.png';
import LogoDark from '../assets/Kreative vit sin fondo letra blanca.png';

const Navbar = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem('practicante_token');
  const userName = localStorage.getItem('practicante_user') || '';
  const isAdmin = localStorage.getItem('practicante_is_admin') === 'true';

  const handleNavAction = () => {
    if (isLoggedIn) {
      if (isAdmin) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/bitacora');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="main-nav animate-fade-down">
      <div className="nav-container">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img
            src={isDarkMode ? LogoDark : LogoLight}
            alt="Kreative Vit"
          />
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            <span className="toggle-bg"></span>
          </button>

          {location.pathname !== '/login' && (
            <button
              className="btn-login-nav"
              onClick={handleNavAction}
            >
              {isLoggedIn ? `Hola, ${userName.split(' ')[0]} 👋` : 'Iniciar Sesión'}
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>

      <style>{`
        .main-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: var(--nav-height);
          z-index: 100;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-logo {
          height: 40px;
          cursor: pointer;
        }

        .nav-logo img {
          height: 100%;
          object-fit: contain;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .theme-toggle-btn {
          position: relative;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-main);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .theme-toggle-btn:hover {
          border-color: var(--primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        .btn-login-nav {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--text-main);
          color: var(--bg-main);
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-login-nav:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
          opacity: 0.9;
        }

        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-down {
          animation: fadeInDown 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @media (max-width: 768px) {
          .nav-container { padding: 0 20px; }
          .btn-login-nav span { display: none; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
