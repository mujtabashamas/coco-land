import React, { useEffect, useState } from 'react';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import MainContent from '../components/Homepage/MainContent';
import { useAppSelector } from '../store/store';
import { useNavigate } from 'react-router';
import socket from '../socket/socket';

const Home = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({})
  const [selectedRoom, setSelectedRoom] = useState('')
  const [activeTab, setActiveTab] = useState('accueil')
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.user.user);
  
  useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])
  
  if(!user) {
    return;
  }

  return (
    <div>
      <Header />
      <MainContent 
        selectedUser={selectedUser} 
        setSelectedUser={setSelectedUser} 
        messages={messages} 
        setMessages={setMessages} 
        selectedRoom={selectedRoom} 
        setSelectedRoom={setSelectedRoom} 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <Footer selectedUser={selectedUser} setMessages={setMessages} activeTab={activeTab} selectedRoom={selectedRoom}/>
    </div>
  )
};

export default Home;
