import React from 'react';
import '../styles/Card.css';

const Card = ({ title, children, className }) => {
    return (
        <div className={`card ${className || ''}`}>
            <div className="card-header">
                <h3 className="card-title">{title}</h3>
            </div>
            <div className="card-content">
                {children}
            </div>
        </div>
    );
};

export default Card;
