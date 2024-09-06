import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import './App.css';
import socket from './socket/socket';
import AdminContent from './pages/AdminContent';

const App = () => {
  socket.on('connection', () => {
    console.log(`Connected with id: ${socket.id}`);
  });

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin' element={<AdminContent />} />
      </Routes>
    </Router>
  );
};

export default App;
