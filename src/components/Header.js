import React from 'react';
import '../styles/Header.css';

const Header = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'all-tasks', label: 'All Tasks' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <header className="header">
      <div className="header-container">
        <div>
          <h1 className="header-title">Day Planner</h1>
          <p className="header-subtitle">DogTech Professional Planning</p>
        </div>
        
        <nav>
          <div className="nav-container">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

export default Header;