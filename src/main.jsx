// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'normalize.css'; // 1. Importe o normalize.css AQUI
import App from './App.jsx';
import './index.css'; // Seu CSS global principal
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);