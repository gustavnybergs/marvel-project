import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "../css/Navbar.css"; // Kontrollera att sökvägen är korrekt

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Stäng menyn när man navigerar eller ändrar storlek på skärmen
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Hantera responsivitet
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <nav className="navbar">
      {/* Logotyp till vänster */}
      <div className="navbar-logo">
        <Link to="/">
          <img src="/logo.png" alt="Marvelous Ratings Logo" />
        </Link>
      </div>

      {/* Hamburgermeny för mobila enheter */}
      <div 
        className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? "Stäng meny" : "Öppna meny"}
        role="button"
        tabIndex={0}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Container för navigationslänkar */}
      <div className={`nav-links-container ${isMenuOpen ? 'open' : ''}`}>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Hem
            </Link>
          </li>
          <li>
            <Link 
              to="/marvel-historia" 
              className={location.pathname === '/marvel-historia' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Marvel Historia
            </Link>
          </li>
          <li>
            <Link 
              to="/characters" 
              className={location.pathname === '/characters' ? 'active' : ''}
              onClick={() => setIsMenuOpen(false)}
            >
              Marvel Karaktärer
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;