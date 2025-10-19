// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { TasksProvider } from './contexts/TasksContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';   
import Toasts from './components/Toasts';                  

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <ThemeProvider>
      <ToastProvider>       
        <TasksProvider>
          <App />
          <Toasts />         
        </TasksProvider>
      </ToastProvider>
    </ThemeProvider>
  </BrowserRouter>
);
