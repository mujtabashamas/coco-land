import React, { useState, useEffect, useRef } from 'react';
import GroupChat from '../tabs/GroupChat';
import { FaTimes } from 'react-icons/fa';
import socket from '../../socket/socket';
import Accueil from '../tabs/Accueil';
import Premium from '../tabs/Premium';
import Resign from '../tabs/Resign';
import Profil from '../tabs/Profil';
import Reset from '../tabs/Reset';
import Info from '../tabs/Info';
import Amiz from '../tabs/Amiz';
import Chat from '../tabs/Chat';
import Modal from 'react-modal';

const MainContent = ({
  selectedUser,
  setSelectedUser,
  messages,
  setMessages,
  selectedRoom,
  setSelectedRoom,
  activeTab,
  setActiveTab,
  showMenu,
  setShowMenu,
  box,
  setBox,
  setChatTab,
}) => {
  const [blockPrivMsg, setBlockPrivMsg] = useState(false);
  const [isChannelSelected, setIsChannelSelected] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [usersSelected, setUsersSelected] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const tabRef = useRef(null);
  const [blockMaleUsers, setBlockMaleUsers] = useState(false);
  const [showMaxAgeUsers, setShowMaxAgeUsers] = useState(false);
  const [showChannelUsers, setShowChannelUsers] = useState(false);
  const [error, setError] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);

  useEffect(() => {
    setChatTab(usersSelected);
  }, [usersSelected, setChatTab]);

  useEffect(() => {
    socket.on('userDisconnected', (data) => {
      setUsersSelected((prevUsers) =>
        // if user then turn userExists to false
        prevUsers.map((item) => {
          if (item.user.id === data.id) {
            return { ...item, userExists: false };
          } else {
            return item;
          }
        })
      );
    });

    return () => {
      socket.off('userDisconnected');
    };
  });

  useEffect(() => {
    socket.on('recieveMessage', (data) => {
      const storeMessage = () => {
        setMessages((prevMsg) => {
          const userMsgs = prevMsg[data.room] || [];
          return { ...prevMsg, [data.room]: [...userMsgs, data] };
        });

        setUsersSelected((prevUsers) => {
          if (!prevUsers.some((item) => item.user.id === data.sender.id)) {
            return [
              ...prevUsers,
              {
                user: data.sender,
                hasNewMsg: data.sender.id !== selectedUser?.id,
                userExists: true,
              },
            ];
          } else {
            return prevUsers.map((item) =>
              item.user.id === data.sender.id
                ? { ...item, hasNewMsg: data.sender.id !== selectedUser?.id }
                : item
            );
          }
        });
      };
      console.log('data', data);

      if (blockPrivMsg) {
        if (usersSelected.find((item) => item.user.id === data.sender.id)) {
          storeMessage();
        }
      } else if (blockMaleUsers) {
        if (data.sender.genre === 'Femme') {
          storeMessage();
        }
      } else if (showMaxAgeUsers) {
        if (data.sender.age <= selectedAge) {
          storeMessage();
        }
      } else if (showChannelUsers) {
        if (
          selectedRoom &&
          selectedRoom.users.find((user) => user.id === data.sender.id)
        ) {
          storeMessage();
        }
      } else {
        alert(456);
        storeMessage();
      }
    });
    return () => {
      socket.off('recieveMessage');
    };
  }, [blockPrivMsg, usersSelected, selectedUser]);

  useEffect(() => {
    socket.on('recieveChannelMessaage', (message, channelId) => {
      // if (selectedRoom.channelId === channelId) {
      setGroupMessages((prevMsgs) => [...prevMsgs, message]);
      console.log('groupmsg', groupMessages);

      setSelectedRoom((prevRoom) => {
        return { ...prevRoom, hasNewMsg: !isChannelSelected };
      });
      // }
    });

    return () => {
      socket.off('recieveChannelMessage');
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (tabRef.current && !tabRef.current.contains(e.target)) {
        document.getElementById('filterTab').classList.add('hidden');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tabRef]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'accueil':
        return (
          <Accueil
            setActiveTab={setActiveTab}
            setSelectedUser={setSelectedUser}
            usersSelected={usersSelected}
            setUsersSelected={setUsersSelected}
            groups={groups}
            setGroups={setGroups}
            setSelectedRoom={setSelectedRoom}
            selectedRoom={selectedRoom}
            setGroupMessages={setGroupMessages}
            box={box}
            setBox={setBox}
            isChannelSelected={isChannelSelected}
            setIsChannelSelected={setIsChannelSelected}
          />
        );
      case 'resign':
        return <Resign />;
      case 'reset':
        return <Reset />;
      case 'profil':
        return <Profil />;
      case 'info':
        return <Info />;
      case 'premium':
        return <Premium />;
      case 'amiz':
        return <Amiz />;
      case 'chat':
        return (
          <Chat
            selectedUser={selectedUser}
            messages={messages}
            setSelectedUser={setSelectedUser}
          />
        );
      case 'groupChat':
        return (
          <GroupChat
            selectedRoom={selectedRoom}
            groups={groups}
            groupMessages={groupMessages}
            setGroupMessages={setGroupMessages}
          />
        );
      default:
        return null;
    }
  };

  const handleFilter = () => {
    const tab = document.getElementById('filterTab');
    tab.classList.remove('hidden');
  };

  const handleAge = (e) => {
    const age = e.target.value;
    if (age && age < 18) {
      setError(`L'âge doit être d'au moins 18 ans`);
    } else {
      setError('');
    }
  };

  const openInfoModal = () => {
    setIsInfoModalOpen(true);
  };

  const openChat = (tab) => {
    setActiveTab('chat');
    setIsChannelSelected(false);
    setSelectedUser(tab.user);
    setUsersSelected((prevUsers) =>
      prevUsers.map((item) =>
        item.user.id === tab.user.id ? { ...item, hasNewMsg: false } : item
      )
    );
  };

  const openGroupChat = () => {
    setSelectedRoom((prev) => ({ ...prev, hasNewMsg: false }));
    setSelectedUser('');
    setActiveTab('groupChat');
    setIsChannelSelected(true);
  };

  const closeChat = (user) => {
    setSelectedUser('');
    setIsChannelSelected(false);
    setActiveTab('accueil');
    setUsersSelected((prevItems) =>
      prevItems.filter((item) => item.user.id !== user.id)
    );
  };

  const closeGroupChat = () => {
    setSelectedUser('');
    setSelectedRoom(null);
    setActiveTab('accueil');
    setIsChannelSelected(false);
  };

  const changeTab = (tab) => {
    setActiveTab(tab);
    toggleMenu();
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeAgeModal = () => {
    setIsAgeModalOpen(false);
    setShowMaxAgeUsers(false);
  };

  return (
    <section className='flex flex-1 justify-center bg-mediumBrown max-h-[77vh] md:max-h-[70vh]'>
      {/* left container */}
      <div className='hidden lg:block min-w-44'></div>

      {/* center container */}
      <div
        className='relative flex flex-col w-full 
           bg-slate-200 border border-black md:ml-2'
      >
        <div className='absolute -top-14 right-3'>
          <div
            className='relative flex flex-col justify-around w-8 h-8 z-50 cursor-pointer md:hidden bg-brown border border-white items-center'
            onClick={toggleMenu}
          >
            <span
              className={`block w-5 h-[2px] bg-white transform transition duration-300 ease-in-out ${
                showMenu ? 'rotate-45 translate-y-2.5' : ''
              }`}
            ></span>
            <span
              className={`block w-5 h-[2px] bg-white transform transition duration-300 ease-in-out ${
                showMenu ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`block w-5 h-[2px] bg-white transform transition duration-300 ease-in-out ${
                showMenu ? '-rotate-45 -translate-y-2.5' : ''
              }`}
            ></span>
          </div>
          {showMenu && (
            <div className='md:hidden fixed z-40 bg-opacity-90 absolute flex flex-col space-y-2 top-0 right-0 pt-10 px-8 pb-2 w-48 bg-lightBrown'>
              <button
                className='font-bold bg-gray-200 border border-black py-1 hover:bg-gray-300'
                onClick={() => changeTab('accueil')}
              >
                Accueil
              </button>
              <button
                className='relative font-bold border border-black py-1 bg-purple-300 hover:bg-purple-400'
                onClick={handleFilter}
              >
                Filtres
              </button>
              <div
                ref={tabRef}
                id='filterTab'
                className='absolute flex flex-col w-36 right-5 px-2 py-6  bg-purple-300 rounded shadow-lg hidden'
              >
                <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
                  Bloquer nvx pv
                </button>
                <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
                  Désactiver Bouclier
                </button>
                <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
                  no mecs
                </button>
                <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
                  Age Max 99
                </button>
                <button className='h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500'>
                  pv du salon only
                </button>
              </div>
              <button
                className={`font-bold bg-yellow-200 border border-black py-1 hover:bg-yellow-300
            ${activeTab === 'resign' && 'border-4 border-yellow-600'}`}
                onClick={() => changeTab('resign')}
              >
                Design
              </button>
              <button
                className={`font-bold bg-green-200 border border-black py-1 hover:bg-green-300
            ${activeTab === 'reset' && 'border-4 border-green-600'}`}
                onClick={() => changeTab('reset')}
              >
                Reset
              </button>
              <button
                className={`font-bold bg-slate-200 border border-black py-1 hover:bg-slate-300
            ${activeTab === 'profil' && 'border-4 border-slate-600'}`}
                onClick={() => changeTab('profil')}
              >
                Profil
              </button>
              <button
                className='font-bold bg-pink-300 hover:bg-pink-400 border border-black py-1'
                onClick={openInfoModal}
              >
                Info
              </button>
              <button
                className={`font-bold bg-yellow-100 hover:bg-yellow-200 border border-black py-1
            ${activeTab === 'premium' && 'border-4 border-yellow-500'}`}
                onClick={() => changeTab('premium')}
              >
                Premium
              </button>
              <button
                className={`font-bold bg-yellow-400 hover:bg-yellow-500 border border-black py-1
            ${activeTab === 'amiz' && 'border-4 border-yellow-700'}`}
                onClick={() => changeTab('amiz')}
              >
                Amiz
              </button>
            </div>
          )}
        </div>
        <div className='flex flex-wrap absolute top-0 -mt-8 ml-4 rounded-t-md overflow-y-hidden'>
          <button
            className={`px-4 py-1 rounded-t-lg border border-black border-b-slate-100 ${
              activeTab === 'accueil' ? 'bg-slate-200' : 'bg-slate-100'
            }`}
            onClick={() => {
              setActiveTab('accueil');
              setIsChannelSelected(false);
              setSelectedUser('');
            }}
          >
            Accueil
          </button>
          {usersSelected &&
            usersSelected?.map((tab, index) => (
              <div
                key={index}
                className={`items-center px-4 space-x-2 py-1 rounded-t-lg border border-black border-b-slate-100 
                  ${
                    !tab.userExists
                      ? 'bg-blue-900'
                      : selectedUser?.id === tab.user.id
                      ? 'bg-blue-300 '
                      : tab.hasNewMsg
                      ? 'bg-yellow-200'
                      : 'bg-blue-200'
                  }
                `}
              >
                <button onClick={() => openChat(tab)}>{tab.user.pseudo}</button>
                <button className='text-xs' onClick={() => closeChat(tab.user)}>
                  <FaTimes />
                </button>
              </div>
            ))}
          {selectedRoom && (
            <div
              className={`bg-black items-center px-4 space-x-2 py-1 rounded-t-lg border border-black border-b-slate-100 ${
                isChannelSelected
                  ? 'bg-blue-300'
                  : selectedRoom.hasNewMsg
                  ? 'bg-yellow-200'
                  : 'bg-blue-200'
              }`}
            >
              <button onClick={openGroupChat}>{selectedRoom.channelId}</button>
              <button className='text-xs' onClick={closeGroupChat}>
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        <div className='h-full overflow-y-hidden'>{renderTabContent()}</div>
      </div>

      {/* right container */}
      <div className='hidden md:flex flex-col space-y-10 min-w-44 p-8'>
        <button
          className={`font-bold bg-gray-200 border border-black py-1 hover:bg-gray-300 ${
            activeTab === 'accueil' && 'border-4 border-gray-500'
          }`}
          onClick={() => setActiveTab('accueil')}
        >
          Accueil
        </button>
        <button
          className='relative font-bold border border-black py-1 bg-purple-300 hover:bg-purple-400'
          onClick={handleFilter}
        >
          Filtres
        </button>
        <div
          ref={tabRef}
          id='filterTab'
          className='absolute flex flex-col w-36 right-4 px-2 py-6  bg-purple-300 rounded shadow-lg hidden'
        >
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 focus:bg-slate-300 ${
              blockPrivMsg && 'bg-slate-300'
            }`}
            onClick={() => setBlockPrivMsg(!blockPrivMsg)}
          >
            Bloquer nvx pv
          </button>
          <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
            Désactiver Bouclier
          </button>
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 ${
              blockMaleUsers && 'bg-slate-300'
            }`}
            onClick={() => setBlockMaleUsers(!blockMaleUsers)}
          >
            no mecs
          </button>
          <div className='flex flex-col mb-2'>
            <button
              className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
                isAgeModalOpen && 'bg-slate-300'
              } ${showMaxAgeUsers && 'bg-slate-300'}`}
              onClick={() => setIsAgeModalOpen(true)}
            >
              Age Max
            </button>
          </div>
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
              showChannelUsers && 'bg-slate-300'
            }`}
            onClick={() => setShowChannelUsers(!showChannelUsers)}
          >
            pv du salon only
          </button>
        </div>
        <button
          className={`font-bold bg-yellow-200 border border-black py-1 hover:bg-yellow-300
            ${activeTab === 'resign' && 'border-4 border-yellow-600'}`}
          onClick={() => setActiveTab('resign')}
        >
          Design
        </button>
        <button
          className={`font-bold bg-green-200 border border-black py-1 hover:bg-green-300
            ${activeTab === 'reset' && 'border-4 border-green-600'}`}
          onClick={() => setActiveTab('reset')}
        >
          Reset
        </button>
        <button
          className={`font-bold bg-slate-200 border border-black py-1 hover:bg-slate-300
            ${activeTab === 'profil' && 'border-4 border-slate-600'}`}
          onClick={() => setActiveTab('profil')}
        >
          Profil
        </button>
        <button
          className='font-bold bg-pink-300 hover:bg-pink-400 border border-black py-1'
          onClick={openInfoModal}
        >
          Info
        </button>
        <button
          className={`font-bold bg-yellow-100 hover:bg-yellow-200 border border-black py-1
            ${activeTab === 'premium' && 'border-4 border-yellow-500'}`}
          onClick={() => setActiveTab('premium')}
        >
          Premium
        </button>
        <button
          className={`font-bold bg-yellow-400 hover:bg-yellow-500 border border-black py-1
            ${activeTab === 'amiz' && 'border-4 border-yellow-700'}`}
          onClick={() => setActiveTab('amiz')}
        >
          Amiz
        </button>
      </div>

      <Modal
        isOpen={isInfoModalOpen}
        onRequestClose={() => setIsInfoModalOpen(false)}
        style={{
          content: {
            top: '50%',
            left: '30%',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '0px',
            border: '2px solid black', // Adjust width for a smaller modal
          },
        }}
      >
        <div className='bg-tabColor p-3'>
          <h4 className='font-bold text-lg'>
            vous n etes pas membre{' '}
            <span className='bg-yellow-100 text-green-500'>Premium</span> sur ce
            complte ou alors celui a expire
          </h4>
        </div>
      </Modal>
      <Modal
        isOpen={isAgeModalOpen}
        style={{
          content: {
            top: '50%',
            left: '50%',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '350px',
            padding: '0px',
            border: '2px solid black', // Adjust width for a smaller modal
          },
        }}
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-lightBrown p-3'>
          <h4 className='text-2xl text-center 3xl:w-1/3center font-semibold'>
            Age
          </h4>
          <div className='mt-6 flex items-center justify-around px-12'>
            <input
              type='number'
              name='age'
              className={`font-semibold text-xl focus:outline-none rounded shadow-xl appearance-none w-12 p-1 border`}
              onChange={(e) => handleAge(e)}
            />
          </div>
          <div className='text-center text-white text-sm mt-2'>{error}</div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={() => {
                setShowMaxAgeUsers(true);
                setIsAgeModalOpen(false);
              }}
            >
              Confirmer
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={closeAgeModal}
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default MainContent;
