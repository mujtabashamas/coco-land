import React, { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../store/store';
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
import Modal from 'react-modal';
import { getSocket } from '../../socket/socket';

const Chat = ({ selectedUser, messages, setSelectedUser, setMessages }) => {
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ url: '', type: '' });
  const user = useAppSelector((state) => state.user.user);
  const room = [user.userID, selectedUser?.userID].sort().join('-');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [boxOpen, setBoxOpen] = useState(true);
  const socket = getSocket();

  //fetch single user
  useEffect(() => {
    async function fetchUser() {
      const res = await fetch(`/api/getUser/${selectedUser.userID}`);
      const data = await res.json();
      setSelectedUser(data);
    }

    socket.on('userUpdated', (userID) => {
      if (selectedUser.userID === userID) {
        fetchUser();
      }
    });

    return () => {
      socket.off('userUpdated');
    };
  }, [selectedUser]);

  useEffect(() => {
    socket.on('typing', (userID) => {
      if (userID === selectedUser.userID) {
        setTyping(true);
      }
    });

    socket.on('stopTyping', (userID) => {
      if (userID === selectedUser.userID) {
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

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const media = {
          url: URL.createObjectURL(file),
          type: file.type,
          name: file.name,
        };

        handleSendMessage(media);
      };
      reader.readAsDataURL(file);
    }
  };

  // const handleImageChange = async (e) => {
  //   const file = e.target.files[0];
  //   //  if file exist send it to the handelSendMessage
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onload = async () => {
  //       const base64String = reader.result;
  //       const media = {
  //         url: base64String,
  //         type: file.type,
  //         name: file.name,
  //       };

  //       reader.readAsDataURL(file);
  //     };
  //   }
  // };

  const handleSendMessage = (media = null) => {
    const room = [user.userID, selectedUser.userID].sort().join('-');

    const chatMessage = {
      text: '',
      media: media,
      sender: user,
      recipient: selectedUser,
      room: room,
      timestamp: new Date().toISOString(),
    };

    socket.emit('sendMessage', { message: chatMessage });
    setMessages((prevItem) => {
      const userMsgs = prevItem[room] || [];
      return { ...prevItem, [room]: [...userMsgs, chatMessage] };
    });
  };

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

  const toggleImageBox = () => {
    const box = document.getElementById('img-box');
    const openBox = document.getElementById('open-box');
    box.classList.toggle('hidden');
    openBox.classList.toggle('hidden');
  };

  return (
    <div className='relative flex flex-col lg:flex-row-reverse bg-gradient-to-b from-blue-300 to-white h-full'>
      {/* Image box */}
      <div className='lg:absolute lg:top-4 lg:right-2 flex justify-end mr-3 xl:w-1/4 py-5'>
        <div
          id='open-box'
          className={`flex flex-col justify-between bg-purple-300 p-2 rounded-lg text-white cursor-pointer ${
            boxOpen ? 'hidden' : 'block'
          }`}
          onClick={toggleImageBox}
        >
          <span className='h-0.5 w-4 bg-black mb-1'></span>
          <span className='h-0.5 w-4 bg-black mb-1'></span>
          <span className='h-0.5 w-4 bg-black'></span>
        </div>
        <div
          id='img-box'
          className='flex bg-blue-200 border border-black h-64 w-60 lg:h-[18rem] lg:w-[18rem]'
        >
          {/* Right div */}
          <div className='flex flex-col w-5/6'>
            <div className='relative flex items-center justify-between py-1 pt-1 px-2'>
              <div className='flex'>
                <div className='flex flex-col bg-lightLilac rounded px-1 items-center justify-center'>
                  <span className='text-xs font-bold'>{selectedUser?.age}</span>
                  <span className='text-xs font-bold'>ans</span>
                </div>
                <div
                  className='flex flex-col uppercase px-3 text-xl c'
                  onClick={togglePopup}
                >
                  <span className='font-bold cursor-pointer'>
                    {selectedUser?.place}
                  </span>
                  <span className='text-xs text-purple-900'>
                    {selectedUser?.filter}
                  </span>
                </div>
              </div>
              <button
                className={`p-1 bg-purple-200 border border-white ${
                  boxOpen ? 'block' : 'hidden'
                }`}
                onClick={toggleImageBox}
              >
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
              <input
                type='file'
                accept='image/*,video/*'
                onChange={handleMediaChange} // Handle media file input
                className='hidden'
                id='mediaUpload'
              />
              <label htmlFor='mediaUpload' className='cursor-pointer'>
                <FaStar className='text-xs lg:text-lg' />
              </label>
              {/* <FaStar className='text-xs lg:text-lg' /> */}
            </button>
            <button
              className='p-1 bg-pink-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaMicrophone className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-blue-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaGlobe className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-purple-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaCircle className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-orange-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaClock className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-pink-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaExclamationTriangle className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-green-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaPlus className='text-xs lg:text-lg' />
            </button>
            <button
              className='p-1 bg-slate-500 border border-white text-white'
              onClick={() => setIsInfoModalOpen(true)}
            >
              <FaQuestion className='text-xs lg:text-lg' />
            </button>
          </div>
        </div>
      </div>
      {/* chatbox */}
      <div className='flex flex-col w-full items-center py-4 overflow-y-auto custom-scrollbar '>
        <div className='flex flex-col space-y-2 p-4 lg:p-6 w-full'>
          {messages[room]?.map((message, index) => (
            <div key={index} className='flex space-x-1'>
              <div className='flex space-x-1'>
                <span
                  className={`font-bold ${
                    message.sender.userID === user.userID
                      ? message.sender.genre === 'Femme'
                        ? 'text-pink-400'
                        : 'text-blue-700'
                      : user.genre === 'Femme'
                      ? 'text-blue-700'
                      : 'text-pink-400'
                  }`}
                >
                  {message.sender.userID === user.userID
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
                      className='h-6 w-6 cursor-pointer'
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
          {selectedUser?.disconnected && (
            <h4 className='text-purple-800 font-bold'>
              l'utilisateur est actuellement hors ligne
            </h4>
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
      <Modal
        isOpen={isInfoModalOpen}
        onRequestClose={() => setIsInfoModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '50%',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '0px',
            border: '2px solid black', // Adjust width for a smaller modal
          },
        }}
        ariaHideApp={false}
      >
        <div className='bg-tabColor p-3'>
          <h4 className='font-bold text-lg'>
            vous n etes pas membre{' '}
            <span className='bg-yellow-100 text-green-500'>Premium</span> sur ce
            complte ou alors celui a expire
          </h4>
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
