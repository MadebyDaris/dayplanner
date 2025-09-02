import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DayPlanner from './components/App/App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
    <DayPlanner />
  // </React.StrictMode>
);

reportWebVitals();
