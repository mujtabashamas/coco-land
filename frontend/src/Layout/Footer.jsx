import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector } from '../store/store';
import { useNavigate } from 'react-router-dom';
import Picker from 'emoji-picker-react';
import { getSocket } from '../socket/socket';

const Footer = ({
  selectedUser,
  setSelectedUser,
  setMessages,
  activeTab,
  selectedRoom,
  showMenu,
  setShowMenu,
  setBox,
  setActiveTab,
  chatTab,
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const user = useAppSelector((state) => state.user.user);
  const [message, setMessage] = useState('');
  const socket = getSocket();

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    if (activeTab === 'chat') {
      if (e.target.value !== '') {
        socket.emit('typing', selectedUser.userID);
      } else {
        socket.emit('stopTyping', selectedUser.userID);
      }
    } else if (activeTab === 'groupChat') {
      if (e.target.value !== '') {
        socket.emit('groupTyping', selectedRoom.channelId);
      } else {
        socket.emit('stopGroupTyping', selectedRoom.channelId);
      }
    }
  };

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => (prevMessage || '') + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSendMessage = (media = null) => {
    socket.emit('stopTyping', selectedUser.userID);
    const room = [user.userID, selectedUser.userID].sort().join('-');

    const chatMessage = {
      text: message,
      media: media,
      sender: user,
      recipient: selectedUser.userID,
      room: room,
    };

    socket.emit('sendMessage', chatMessage);
    setMessages((prevItem) => {
      const userMsgs = prevItem[room] || [];
      return { ...prevItem, [room]: [...userMsgs, chatMessage] };
    });
    setMessage('');
  };

  const handleSendGroupMessage = (media = null) => {
    console.log('send funcsion', media);
    socket.emit('stopGroupTyping', selectedRoom.channelId);
    const groupMessage = {
      sender: user,
      text: message,
      media: media,
    };

    socket.emit('sendChannelMessage', selectedRoom.channelId, groupMessage);

    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
      if (activeTab === 'chat') {
        handleSendMessage();
      } else if (activeTab === 'groupChat') {
        handleSendGroupMessage();
      }
      e.preventDefault();
    }
  };

  const handleContent = (title) => {
    setBox(title);
    setActiveTab('accueil');
  };

  const handleChat = () => {
    if (chatTab.length === 0) {
      setActiveTab('accueil');
      setBox('users-online');
    } else {
      setSelectedUser(chatTab[0]);
      setActiveTab('chat');
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    console.log('file;, ', file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const media = {
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
        };
        console.log('sending msg', media);
        handleSendGroupMessage(media);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <footer className='bg-lightBrown pb-1 pt-5'>
      <div
        className={`md:block container mx-auto pb-3 space-y-6 ${
          activeTab === 'chat' || 'groupChat' ? 'block' : 'hidden'
        }`}
      >
        <div className='flex flex-row px-4 items-center justify-between space-x-5'>
          <button className='bg-yellow-100 border border-black px-2 py-1 font-bold'>
            Premium
          </button>

          <div className='flex items-center w-full border border-black px-2 h-10 bg-white relative'>
            <input
              type='text'
              value={message}
              onChange={(e) => handleInputChange(e)}
              onKeyDown={handleKeyDown}
              className='w-full focus:outline-none px-2'
              placeholder={
                selectedRoom.channelId === 'ANNONCES'
                  ? `Seul l'administrateur peut écrire`
                  : 'Écrivez un message...'
              }
              disabled={
                selectedRoom.channelId === 'ANNONCES' ||
                selectedUser?.disconnected ||
                !(activeTab === 'groupChat' || activeTab === 'chat')
              }
            />
          </div>

          {/* Media Button same as smiley one */}
          {activeTab === 'groupChat' && (
            <button className='relative bg-yellow-200 border border-black px-3 py-1 font-bold hover:bg-yellow-300'>
              <label htmlFor='mediaUpload'>Media</label>
              <input
                type='file'
                accept='image/*,video/*'
                onChange={handleMediaChange} // Handle media file input
                className='hidden'
                id='mediaUpload'
              />
              {/* <FaStar className='text-xs lg:text-lg' /> */}
            </button>
          )}
          <button
            className='relative hidden md:block bg-blue-200 border border-black px-3 py-1 font-bold hover:bg-blue-300'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            Smiley
            {showEmojiPicker && (
              <div className='absolute bottom-8 left-[calc(50%-250px)]'>
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </button>
        </div>

        <div className='hidden md:flex justify-end items-center space-x-5'>
          <a href='#'>Réglement</a>
          <a href='#'>Contact</a>
          <a href='#'>Aide</a>
          <a href='#'>Jeux Gratuits</a>
        </div>
      </div>

      <div className='flex md:hidden bg-gray-300 items-center'>
        <div
          className='text-center pt-3 h-36 w-full hover:bg-gray-400 border border-black cursor-pointer'
          onClick={handleChat}
        >
          Clavier
        </div>
        <div
          className='text-center pt-3 h-36 w-full hover:bg-gray-400 border border-black cursor-pointer'
          onClick={() => handleContent('channels')}
        >
          Salons
        </div>
        <div
          className='text-center pt-3 h-36 w-full hover:bg-gray-400 border border-black cursor-pointer'
          onClick={() => handleContent('users-online')}
        >
          Connectés
        </div>
        <div
          className='text-center pt-3 h-36 w-full hover:bg-gray-400 border border-black cursor-pointer'
          onClick={() => setShowMenu(!showMenu)}
        >
          Options
        </div>
      </div>
    </footer>
  );
};

export default Footer;
