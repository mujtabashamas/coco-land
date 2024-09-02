import React, { useState } from 'react';
import { useAppSelector } from '../store/store';
import Picker from 'emoji-picker-react';
import socket from '../socket/socket';

const Footer = ({ selectedUser, setMessages, activeTab, selectedRoom }) => {
  const user = useAppSelector((state) => state.user.user);
  const [message, setMessage] = useState('');
  const [media, setMedia] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const onEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => (prevMessage || '') + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMedia({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      });
    }
  };

  const handleSendMessage = () => {
    const room = [socket.id, selectedUser.id].sort().join('-');

    if (message.trim() || media) {
      const chatMessage = {
        text: message,
        media: media,
        sender: user,
        recipient: selectedUser.id,
        room: room,
        timestamp: new Date().toISOString(),
      };

      socket.emit('sendMessage', { message: chatMessage });
      setMessages((prevItem) => {
        const userMsgs = prevItem[room] || [];
        return { ...prevItem, [room]: [...userMsgs, chatMessage] };
      });
      setMessage('');
      setMedia(null);
    }
  };

  const handleSendGroupMessage = () => {
    const groupMessage = {
      sender: user,
      text: message,
      media: media,
      timestamp: new Date().toISOString(),
      // room: selectedRoom.groupName,
    };

    socket.emit('sendChannelMessage', selectedRoom.channelId, groupMessage);

    setMessage('');
    setMedia(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (activeTab === 'chat') {
        handleSendMessage();
      } else if (activeTab === 'groupChat') {
        handleSendGroupMessage();
      }
      e.preventDefault();
    }
  };

  return (
    <footer className='bg-lightBrown h-[8rem]'>
      <div className='container pt-5 mx-auto space-y-10'>
        <div className='flex flex-row items-center justify-between space-x-5'>
          <button className='bg-yellow-100 border border-black px-2 py-1 font-bold'>
            Premium
          </button>

          <div className='flex items-center w-full border border-black px-2 h-10 bg-white relative'>
            {/* Display selected media in the input area */}
            {media && (
              <div className='flex items-center space-x-2'>
                {media.type.startsWith('image/') && (
                  <img
                    src={media.url}
                    alt={media.name}
                    className='h-full max-h-8 cursor-pointer transition-all duration-200 ease-in-out hover:max-h-32'
                  />
                )}
                {media.type.startsWith('video/') && (
                  <video
                    src={media.url}
                    className='h-full max-h-8 cursor-pointer transition-all duration-200 ease-in-out hover:max-h-32'
                  />
                )}
              </div>
            )}
            {/* <input type="number" value={room} onChange={(e) => setRoom(e.target.value)} onKeyDown={handleJoinRoom} /> */}
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className='w-full focus:outline-none px-2'
              placeholder={
                media
                  ? 'Type a message or press Enter to send...'
                  : 'Type a message...'
              }
            />
          </div>

          <input
            type='file'
            accept='image/*,video/*'
            onChange={handleMediaChange} // Handle media file input
            className='hidden'
            id='mediaUpload'
          />
          <label
            htmlFor='mediaUpload'
            className='bg-green-200 border border-black px-3 py-1 font-bold cursor-pointer'
          >
            Media
          </label>
          <button
            className='relative bg-blue-200 border border-black px-3 py-1 font-bold'
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            Smiley
            {showEmojiPicker && (
              <div className='absolute bottom-8 left-[calc(50%-150px)]'>
                <Picker onEmojiClick={onEmojiClick} />
              </div>
            )}
          </button>
        </div>

        <div className='flex justify-end items-center mt-6 space-x-4'>
          <a href='#'>Réglement</a>
          <a href='#'>Contact</a>
          <a href='#'>Aide</a>
          <a href='#'>Jeux Gratuits</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
