import React, { useState } from 'react';
import { ChevronsUpDown, PlusCircle, LogOut, Settings, Users, Home, CheckSquare, Calendar, BarChart3, Moon, Sun } from 'lucide-react';
import '../styles/SideBar.css';

import { useTheme } from '../services/ThemeContext';

const SideBar = ({ currentPage, setCurrentPage, user, onLogout, currentTeam, userTeams, switchTeam }) => {
    const { theme, toggleTheme } = useTheme();
    const [isTeamSwitcherOpen, setIsTeamSwitcherOpen] = useState(false);

    const handleSwitchTeam = (team) => {
        switchTeam(team);
        setIsTeamSwitcherOpen(false);
    };

    const navigationItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home },
        { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
        { id: 'agenda', label: 'Agenda', icon: Calendar },
        { id: 'reports', label: 'Reports', icon: BarChart3 },
        { id: 'team', label: 'Team', icon: Users },
    ];

    if (!user) {
        return null; // Or a loading spinner
    }

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <div className="team-switcher">
                    <button onClick={() => setIsTeamSwitcherOpen(!isTeamSwitcherOpen)} className="team-switcher-button">
                        <div className="team-info">
                            <div className="team-icon" style={{ backgroundColor: currentTeam?.color || '#3b82f6' }}>
                                {currentTeam?.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="team-name">{currentTeam?.name || 'Select a Team'}</span>
                        </div>
                        <ChevronsUpDown size={18} />
                    </button>
                    {isTeamSwitcherOpen && (
                        <div className="team-dropdown">
                            {userTeams.map(({ team }) => (
                                <div key={team.id} onClick={() => handleSwitchTeam(team)} className="team-dropdown-item">
                                    <div className="team-icon" style={{ backgroundColor: team.color }}>
                                        {team.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span>{team.name}</span>
                                </div>
                            ))}
                            <div className="team-dropdown-divider"></div>
                            <button className="team-dropdown-action">
                                <PlusCircle size={16} />
                                <span>Create or Join Team</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {navigationItems.map(item => (
                        <li key={item.id} className={`nav-item ${currentPage === item.id ? 'active' : ''}`}>
                            <button onClick={() => setCurrentPage(item.id)} className="nav-button">
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="user-profile">
                    <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=fff`}
                        alt={user.name} 
                        className="user-avatar"
                    />
                    <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                    </div>
                </div>
                <div className="sidebar-actions">
                    <button onClick={toggleTheme} className="action-button">
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>
                    <button className="action-button"><Settings size={18} /></button>
                    <button onClick={onLogout} className="action-button"><LogOut size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default SideBar;