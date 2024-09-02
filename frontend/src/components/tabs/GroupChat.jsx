import React, { useState, useEffect, useRef } from 'react';
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
import socket from '../../socket/socket';

const GroupChat = ({ selectedRoom, groups, groupMessages }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [modalContent, setModalContent] = useState({ url: '', type: '' });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    groups.map((group) => {
      if (group.channelId === selectedRoom.channelId) {
        setMessages(group.msgs);
      }
    });
  }, [selectedRoom, groups, groupMessages]);

  useEffect(() => {
    socket.on('recieveChannelMessaage', (message, channelId) => {
      if (channelId === selectedRoom.channelId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('recieveChannelMessage');
    };
  }, []);

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
    <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
      <div className='flex flex-col space-y-4 space-x-2 p-6 font-bold w-full 2xl:w-3/4 overflow-y-auto'>
        <h4 className='text-purple-800 text-center '>
          Welcome to {selectedRoom.channelId}
        </h4>
        {messages?.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.sender.id === socket.id ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`p-3 rounded-lg text-white inline-block max-w-3/4 ${
                message.sender.id === socket.id ? 'bg-darkLilac' : 'bg-pinkRose'
              }`}
            >
              <span className='font-bold'>
                {message.sender.id === socket.id ? 'Me' : message.sender.pseudo}
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
        ))}
      </div>

      {/* imagebox */}
      <div className='hidden 2xl:ml-5 2xl:flex justify-center w-1/4 py-10 mx-auto'>
        <div className='flex space-x-2 bg-blue-200 border border-black h-[18rem] w-[18rem]'>
          {/* Right div */}
          <div className='flex flex-col w-4/5'>
            <div className='flex items-center justify-between py-2'>
              <div className='uppercase font-semibold px-3 text-xl'>
                Etramger
              </div>
              <button className='p-1 bg-purple-200 border border-white'>
                <FaTimes />
              </button>
            </div>
            {/* img */}
            <div className='mx-1 my-2'>
              {/* <img
                src={Image}
                alt='Image'
                className='border border-black w-56 h-56 '
              /> */}
            </div>
          </div>

          {/* left div */}
          <div className='flex flex-col space-y-2 p-2 justify-end items-center'>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaStar />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaMicrophone />
            </button>
            <button className='p-1 bg-blue-500 border border-white text-white'>
              <FaGlobe />
            </button>
            <button className='p-1 bg-purple-500 border border-white text-white'>
              <FaCircle />
            </button>
            <button className='p-1 bg-orange-500 border border-white text-white'>
              <FaClock />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaExclamationTriangle />
            </button>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaPlus />
            </button>
            <button className='p-1 bg-slate-500 border border-white text-white'>
              <FaQuestion />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
