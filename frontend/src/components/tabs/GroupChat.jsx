import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useAppSelector } from '../../store/store';
import Camera from '../../assets/camera.webp';
import { getSocket } from '../../socket/socket';

const GroupChat = ({
  selectedRoom,
  setSelectedRoom,
  groups,
  groupMessages,
}) => {
  const user = useAppSelector((state) => state.user.user);
  const [modalContent, setModalContent] = useState({ url: '', type: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    async function fetchChannel() {
      try {
        const res = await fetch(`/api/getChannel/${selectedRoom.channelId}`);
        const data = await res.json();
        setSelectedRoom({ ...data, hasNewMessage: false });
      } catch (err) {
        console.log(err);
      }
    }

    socket.on('channelUpdated', (channelId) => {
      if (selectedRoom.channelId === channelId) {
        fetchChannel();
      }
    });
  }, []);
  // useEffect(() => {
  //   // update group through api every 5 seconds
  //   const interval = setInterval(() => {
  //     async function fetchGroupMessages() {
  //       const res = await fetch(`/api/groups/${selectedRoom.channelId}`);
  //       const data = await res.json();
  //       setMessages(data.messages);
  //     }

  //     fetchGroupMessages();
  //   }, 5000);
  // }, []);

  useEffect(() => {
    socket.on('groupType', (room) => {
      if (room === selectedRoom.channelId) {
        setTyping(true);
      }
    });

    socket.on('stopGroupType', (room) => {
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
    <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
      {/* chatbox */}
      <div className='flex flex-col space-y-2 p-4 lg:p-6 w-full overflow-y-auto custom-scrollbar'>
        <h4 className='text-purple-800 text-center'>
          Welcome to {selectedRoom.channelId}
        </h4>
        {groupMessages?.map((message, index) => (
          <div key={index} className='flex space-x-1 w-full '>
            <div className='flex space-x-1'>
              <span
                className={`font-bold ${
                  message.sender.genre === 'Femme'
                    ? 'text-pink-400'
                    : 'text-blue-700'
                }`}
              >
                {message.sender.userID === user.userID
                  ? user.pseudo
                  : message.sender.pseudo}
                :{' '}
              </span>
              <span className='font-baseline break-words whitespace-pre-wrap break-all'>
                {message.text}
              </span>
            </div>
            {/* Render the media if it exists */}
            {message.media?.type && message.media.type.startsWith('image/') && (
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
            {message.media?.type && message.media.type.startsWith('video/') && (
              <video
                src={message.media.url}
                controls
                className='max-w-xs rounded cursor-pointer'
                onClick={() => openModal(message.media.url, message.media.type)}
              ></video>
            )}
            {isModalOpen && (
              <div
                className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'
                onClick={closeModal} // Close modal on overlay click
              >
                <div
                  className='relative max-w-full max-h-full'
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
      {/*userslist  */}
      <div className='m-2 w-52 py-4 overflow-y-auto custom-scrollbar'>
        {selectedRoom?.users?.map((u, index) => (
          <div
            key={index}
            className={`flex items-center justify-center border border-black text-center py-1 space-y-1 ${
              u.genre === 'Femme' ? 'bg-pinkRose' : 'bg-lilac'
            }`}
          >
            <span
              className={`break-words whitespace-pre-wrap break-all ${
                u.userID === user.userID && 'hidden'
              }`}
            >
              {u.pseudo}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupChat;
