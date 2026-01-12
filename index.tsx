import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Lógica do Tema de Natal
if (new Date().getMonth() === 11) {
  document.body.setAttribute('data-theme', 'christmas');
  
  const santa = document.createElement('div');
  santa.className = 'santa-sleigh animate-sleigh';
  santa.innerHTML = '🎅🛷🦌🦌🦌';
  document.body.appendChild(santa);

  setInterval(() => {
    const flake = document.createElement('div');
    flake.className = 'snowflake animate-snow';
    flake.style.left = Math.random() * 100 + 'vw';
    flake.style.animationDuration = (Math.random() * 5 + 5) + 's';
    flake.innerHTML = ['❄', '❅', '❆', '🎅', '🎁'][Math.floor(Math.random() * 5)];
    document.body.appendChild(flake);
    setTimeout(() => flake.remove(), 10000);
  }, 800);
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);