import React, { useState, useEffect, useRef } from 'react';
import socket from '../../socket/socket';
import { FaTimes } from 'react-icons/fa';

const GroupChat = ({ selectedRoom, groups, groupMessages }) => {
  const [modalContent, setModalContent] = useState({ url: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    socket.on('groupTyping', (room) => {
      if (room === selectedRoom.channelId) {
        setTyping(true);
      }
    });

    socket.on('stopGroupTyping', (room) => {
      if (room === selectedRoom.channelId) {
        setTyping(false);
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [selectedRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openModal = (url, type) => {
    setModalContent({ url, type });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    console.log('selectedRoom', selectedRoom),
    console.log('groupMessages', groupMessages),
    (
      <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
        <div className='flex flex-col space-y-4 space-x-2 p-6 font-bold w-full 2xl:w-3/4 overflow-y-auto'>
          <h4 className='text-purple-800 text-center '>
            Welcome to {selectedRoom.channelId}
          </h4>
          {groupMessages[selectedRoom.channelId]?.map(
            (message, index) => (
              console.log('groypmsgs', groupMessages[selectedRoom.channelId]),
              (
                <div
                  key={index}
                  className={`mb-2 ${
                    message.sender.id === socket.id ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg text-white inline-block max-w-3/4 ${
                      message.sender.id === socket.id
                        ? 'bg-darkLilac'
                        : 'bg-pinkRose'
                    }`}
                  >
                    <span className='font-bold'>
                      {message.sender.id === socket.id
                        ? 'Me'
                        : message.sender.pseudo}
                      : &nbsp;
                    </span>
                    <span className='font-semibold mr-9'>{message.text}</span>

                    {message.media?.type &&
                      message.media.type.startsWith('image/') && (
                        <img
                          src={message.media.url}
                          alt='media'
                          className='max-w-xs rounded cursor-pointer'
                          onClick={() =>
                            openModal(message.media.url, message.media.type)
                          }
                        />
                      )}
                    {message.media?.type &&
                      message.media.type.startsWith('video/') && (
                        <video
                          src={message.media.url}
                          controls
                          className='max-w-xs rounded cursor-pointer'
                          onClick={() =>
                            openModal(message.media.url, message.media.type)
                          }
                        ></video>
                      )}
                    <span className='text-xs'>
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleString()
                        : ''}
                    </span>
                    {isModalOpen && (
                      <div
                        className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'
                        onClick={closeModal}
                      >
                        <div
                          className='relative max-w-full max-h-full'
                          onClick={(e) => e.stopPropagation}
                        >
                          <button
                            className='absolute top-2 right-2 text-white text-xl'
                            onClick={closeModal}
                          >
                            <FaTimes />
                          </button>
                          {modalContent.type.startsWith('image/') && (
                            <img
                              src={modalContent.url}
                              alt='modal media'
                              className='max-w-full max-h-full object-contain'
                            />
                          )}
                          {modalContent.type.startsWith('video/') && (
                            <video
                              src={modalContent.url}
                              controls
                              className='max-w-full max-h-full object-contain'
                            ></video>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            )
          )}
          {typing && (
            <div className='absolute bottom-0'>
              <span className='bg-yellow-300 rounded-lg px-4 py-1 '>
                en train d'écrire...
              </span>
            </div>
          )}
        </div>
      </div>
    )
  );
};

export default GroupChat;
