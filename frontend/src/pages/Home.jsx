import React, { useEffect, useState } from 'react';
import MainContent from '../components/Homepage/MainContent';
import { useAppSelector } from '../store/store';
import { useNavigate } from 'react-router';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';

const Home = () => {
  const user = useAppSelector((state) => state.user.user);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('accueil');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [messages, setMessages] = useState({});
  const [chatTab, setChatTab] = useState([]);
  const [box, setBox] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) {
    return;
  }

  return (
    <div className='flex flex-col h-screen overflow-y-hidden'>
      <div className='p-9 md:p-0 bg-lightBrown'>
        <div className='hidden md:block'>
          <Header />
        </div>
      </div>

      <MainContent
        setSelectedUser={setSelectedUser}
        setSelectedRoom={setSelectedRoom}
        selectedUser={selectedUser}
        selectedRoom={selectedRoom}
        setActiveTab={setActiveTab}
        setShowMenu={setShowMenu}
        setMessages={setMessages}
        activeTab={activeTab}
        messages={messages}
        showMenu={showMenu}
        box={box}
        setBox={setBox}
        setChatTab={setChatTab}
      />
      <Footer
        setSelectedUser={setSelectedUser}
        selectedUser={selectedUser}
        selectedRoom={selectedRoom}
        setActiveTab={setActiveTab}
        setMessages={setMessages}
        setShowMenu={setShowMenu}
        activeTab={activeTab}
        showMenu={showMenu}
        setBox={setBox}
        chatTab={chatTab}
      />
    </div>
  );
};

export default Home;
