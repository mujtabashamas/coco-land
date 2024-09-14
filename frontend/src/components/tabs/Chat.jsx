import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/store';
import socket from '../../socket/socket';
import {
  FaExclamationTriangle,
  FaPlus,
  FaQuestion,
  FaStar,
  FaMicrophone,
  FaGlobe,
  FaClock,
  FaTimes,
  FaCircle,
} from 'react-icons/fa';
import Camera from '../../assets/camera.webp';

const Chat = ({ selectedUser, messages, setSelectedUser }) => {
  const [modalContent, setModalContent] = useState({ url: '', type: '' });
  const room = [socket.id, selectedUser?.id].sort().join('-');
  const user = useAppSelector((state) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    socket.on('userDisconnected', (data) => {
      setMsg(`${data.pseudo} est actuellement hors ligne`);
    });

    return () => {
      socket.off('userDisconnected');
    };
  });

  useEffect(() => {
    socket.on('updateUserList', (users) => {
      setSelectedUser(users.find((user) => user.id === selectedUser.id));
    });
  }, [selectedUser]);

  useEffect(() => {
    socket.on('typing', (sender) => {
      if (sender === selectedUser.id) {
        setTyping(true);
      }
    });

    socket.on('stopTyping', (sender) => {
      if (sender === selectedUser.id) {
        setTyping(false);
      }
    });

    return () => {
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages[room]]);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const openModal = (url, type) => {
    setModalContent({ url, type });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='relative flex flex-col lg:flex-row-reverse bg-gradient-to-b from-blue-300 to-white h-full'>
      {/* Image box */}
      <div className='absolute top-4 right-2 flex justify-end mr-3 xl:w-1/4 py-5'>
        <div className='flex bg-blue-200 border border-black h-64 w-60 lg:h-[18rem] lg:w-[18rem]'>
          {/* Right div */}
          <div className='flex flex-col w-5/6'>
            <div className='relative flex items-center justify-between py-1 pt-2 px-2'>
              <div className='flex'>
                <div className='flex flex-col bg-lightLilac rounded px-1 items-center justify-center'>
                  <span className='text-xs font-bold'>{selectedUser?.age}</span>
                  <span className='text-xs font-bold'>ans</span>
                </div>
                <div className='uppercase px-3 text-xl c' onClick={togglePopup}>
                  <span className='font-bold'>{selectedUser?.place}</span>
                </div>
              </div>
              <button className='p-1 bg-purple-200 border border-white'>
                <FaTimes className='text-xs lg:text-lg' />
              </button>
              {isPopupOpen && (
                <div className='absolute top-0 right-0 w-80 h-88 bg-blue-200 border border-black shadow-lg p-4 z-50'>
                  <img src={selectedUser?.image} alt='' className='h-64 w-64' />
                  <p>Pseudo: {selectedUser.pseudo}</p>
                  <p>Age: {selectedUser.age}</p>
                  <p>Genre: {selectedUser.genre}</p>

                  {/* Close button */}
                  <button
                    className='absolute top-2 right-2 text-black'
                    onClick={togglePopup}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
            {/* img */}
            <div className='mx-1 my-2'>
              <img
                src={selectedUser?.image}
                alt='Image'
                className='border border-black w-48 h-48 lg:w-56 lg:h-56 cursor-pointer'
              />
            </div>
          </div>
          {/* Left div */}
          <div className='flex flex-col space-y-2 p-2 justify-center items-center'>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaStar className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaMicrophone className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-blue-500 border border-white text-white'>
              <FaGlobe className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-purple-500 border border-white text-white'>
              <FaCircle className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-orange-500 border border-white text-white'>
              <FaClock className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaExclamationTriangle className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaPlus className='text-xs lg:text-lg' />
            </button>
            <button className='p-1 bg-slate-500 border border-white text-white'>
              <FaQuestion className='text-xs lg:text-lg' />
            </button>
          </div>
        </div>
      </div>
      {/* chatbox */}
      <div className='flex flex-col w-full items-center py-4 overflow-y-auto custom-scrollbar '>
        <h4 className='text-purple-800'>{msg}</h4>

        <div className='flex flex-col space-y-2 p-4 lg:p-6 w-full'>
          {messages[room]?.map((message, index) => (
            <div key={index} className='flex md:flex-col space-x-1'>
              <div className='flex space-x-1'>
                <span
                  className={`font-bold ${
                    message.sender.id === socket.id
                      ? message.sender.genre === 'Femme'
                        ? 'text-pink-400'
                        : 'text-blue-700'
                      : message.sender.genre === 'Femme'
                      ? 'text-blue-700'
                      : 'text-pink-400'
                  }`}
                >
                  {message.sender.id === socket.id
                    ? user.pseudo
                    : selectedUser.pseudo}
                  :{' '}
                </span>
                <span className='font-baseline break-words'>
                  {message.text}
                </span>
              </div>
              {/* Render the media if it exists */}
              {message.media?.type &&
                message.media.type.startsWith('image/') && (
                  <>
                    <img
                      src={Camera}
                      alt='media'
                      className='block md:hidden h-8 w-8 cursor-pointer'
                      onClick={() =>
                        openModal(message.media.url, message.media.type)
                      }
                    />
                    <img
                      src={message.media.url}
                      alt='media'
                      className='hidden md:block max-w-xs rounded cursor-pointer'
                      onClick={() =>
                        openModal(message.media.url, message.media.type)
                      }
                    />
                  </>
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
              {isModalOpen && (
                <div
                  className='fixed inset-0 bg-black bg-opacity-20 flex justify-center items-center z-50'
                  onClick={closeModal} // Close modal on overlay click
                >
                  <div
                    className='relative max-w-lg max-h-lg'
                    onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
                  >
                    <button
                      onClick={closeModal}
                      className='absolute top-2 right-2 text-white text-xl'
                    >
                      <FaTimes size={30} />
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
              {/* End of media rendering */}
            </div>
          ))}
          {typing && (
            <div className='absolute bottom-0'>
              <span className='bg-yellow-300 rounded-lg px-4 py-1 '>
                en train d'écrire...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
