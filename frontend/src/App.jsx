import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminContent from './pages/AdminContent';
import AdminLogin from './pages/AdminLogin';
import socket from './socket/socket';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css';

const App = () => {
  socket.on('connection', () => {
    alert(123);
    console.log(`Connected with id: ${socket.id}`);
  });

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/admin-login' element={<AdminLogin />} />
        <Route path='/admin' element={<AdminContent />} />
      </Routes>
    </Router>
  );
};

export default App;
