import React, { useEffect, useState } from 'react';
import Header from '../Layout/Header';
import Footer from '../Layout/Footer';
import MainContent from '../components/Homepage/MainContent';
import { useAppSelector } from '../store/store';
import { useNavigate } from 'react-router';
import socket from '../socket/socket';

const Home = () => {
  const [usersSelected, setUsersSelected] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({})

  const user = useAppSelector((state) => state.user.user);
  const navigate = useNavigate();

  
  useEffect(() => {
    socket.on('recieveMessage', (data) => {
        console.log('data',data)
        // if (data.room === room)
        // {
            // setMessages((prevItem) => [...prevItem, {selectedUser: selectedUser.id, message: data}])
            console.log('msg before setting', messages)
            setMessages((prevItem) => {
                const userMsgs = prevItem[data.room] || [];
                console.log('usersmsg,', userMsgs)
                return { ...prevItem, [data.room]: [...userMsgs, data]}
            })
            console.log('msgs after setting', messages)
            // setMessages((prevMessages) => {
            //     // If user key doesn't exist, create an array for that user
            //     const userMessages = prevMessages[user] || [];
            //     // Append the new message to the user's message array
            //     return { ...prevMessages, [user]: [...userMessages, msg] };
            //   });
        // }
    })
    return () => {
        socket.off('recieveMessage')
    }
  }, [])
  console.log('msgs form home', messages);
  // useEffect(() => {
  //   socket.on('recieveMessage', (data) => {
  //       console.log('data',data)
  //       if (data.recipient === socket.id)
  //       {
  //           // setMessages((prevItem) => [...prevItem, {selectedUser: selectedUser.id, message: data}])
  //           setMessages((prevItem) => {
  //               const userMsgs = prevItem[selectedUser.id] || [];
  //               return { ...prevItem, [selectedUser.id]: [...userMsgs, data]}
  //           })
  //           // setMessages((prevMessages) => {
  //           //     // If user key doesn't exist, create an array for that user
  //           //     const userMessages = prevMessages[user] || [];
  //           //     // Append the new message to the user's message array
  //           //     return { ...prevMessages, [user]: [...userMessages, msg] };
  //           //   });
  //       }
  //   })
  //   return () => {
  //       socket.off('recieveMessage')
  //   }
  // }, [])
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
      <MainContent selectedUser={selectedUser} setSelectedUser={setSelectedUser} usersSelected={usersSelected} setUsersSelected={setUsersSelected} messages={messages} setMessages={setMessages} />
      <Footer selectedUser={selectedUser} setSelectedUser={setSelectedUser} usersSelected={usersSelected} setUsersSelected={setUsersSelected} setMessages={setMessages}/>
    </div>
  )
};

export default Home;
