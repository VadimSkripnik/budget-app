// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )

// // src/main.jsx
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App.jsx';
// import './index.css';
// import { BrowserRouter as Router } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext.jsx'; // Импортируем провайдер

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <Router>
//       <AuthProvider> {/* Оборачиваем все приложение */}
//         <App />
//       </AuthProvider>
//     </Router>
//   </React.StrictMode>,
// );


// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { CategoryProvider } from './context/CategoryContext.jsx'; // <-- Импортируем провайдер

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        {/* Оборачиваем здесь: CategoryProvider должен видеть AuthProvider */}
        <CategoryProvider> 
          <App />
        </CategoryProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
);


