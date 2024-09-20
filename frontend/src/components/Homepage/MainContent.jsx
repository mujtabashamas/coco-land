import React, { useState, useEffect, useRef } from 'react';
import GroupChat from '../tabs/GroupChat';
import { FaTimes, FaHeart } from 'react-icons/fa';
import Accueil from '../tabs/Accueil';
import Premium from '../tabs/Premium';
import Resign from '../tabs/Resign';
import Profil from '../tabs/Profil';
import Reset from '../tabs/Reset';
import Info from '../tabs/Info';
import Amiz from '../tabs/Amiz';
import Chat from '../tabs/Chat';
import Modal from 'react-modal';
import { getSocket } from '../../socket/socket';
import axios from 'axios';
import { useAppSelector } from '../../store/store';

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
  const user = useAppSelector((state) => state.user.user);
  const [showChannel, setShowChannel] = useState(false);
  const [isChannelSelected, setIsChannelSelected] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [usersSelected, setUsersSelected] = useState([]);
  const [groupMessages, setGroupMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const tabRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState([]);
  const [error, setError] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const socket = getSocket();

  useEffect(() => {
    setChatTab(usersSelected);
  }, [usersSelected, setChatTab]);

  useEffect(() => {
    const updateUser = (userID, disconnect) => {
      alert(disconnect);
      setUsersSelected((prevUsers) =>
        prevUsers.map((item) => {
          if (item.userID === userID) {
            return { ...item, disconnected: disconnect };
          } else {
            return item;
          }
        })
      );
      if (selectedUser?.userID === userID) {
        setSelectedUser((prevUser) => {
          return { ...prevUser, disconnected: disconnect };
        });
      }
      console.log('selecteduser', selectedUser);
      console.log('usersleected', usersSelected);
    };
    socket.on('userDisconnected', (userID) => updateUser(userID, true));
    socket.on('reconnected', (userID) => updateUser(userID, false));

    return () => {
      socket.off('userDisconnected');
      socket.off('reconnected');
    };
  }, [socket, usersSelected, selectedUser]);

  useEffect(() => {
    socket.on('recieveMessage', (data) => {
      console.log('data', data);
      const storeMessage = () => {
        setMessages((prevMsg) => {
          const userMsgs = prevMsg[data.room] || [];
          return { ...prevMsg, [data.room]: [...userMsgs, data] };
        });

        setUsersSelected((prevUsers) => {
          if (!prevUsers.some((item) => item.userID === data.sender.userID)) {
            return [
              ...prevUsers,
              {
                ...data.sender,
                hasNewMsg: data.sender.userID !== selectedUser?.userID,
              },
            ];
          } else {
            return prevUsers.map((item) =>
              item.userID === data.sender.userID
                ? {
                    ...item,
                    hasNewMsg: data.sender.userID !== selectedUser?.userID,
                  }
                : item
            );
          }
        });
      };

      if (
        !activeFilter ||
        ((!activeFilter.includes('Bloquer nvx pv') ||
          usersSelected.find((item) => item.userID === data.sender.userID)) &&
          (!activeFilter.includes('no mecs') ||
            data.sender.genre !== 'Homme') &&
          (!activeFilter.includes('Age Max') ||
            data.sender.age <= selectedAge) &&
          (!activeFilter.includes('pv du salon only') ||
            (selectedRoom &&
              selectedRoom.users.find(
                (user) => user.userID === data.sender.userID
              ))))
      ) {
        storeMessage();
      }
    });
    return () => {
      socket.off('recieveMessage');
    };
  }, [activeFilter, selectedAge, selectedRoom, selectedUser, usersSelected]);

  useEffect(() => {
    socket.on('recieveChannelMessage', (message) => {
      console.log('mdg', message);
      setGroupMessages((prevMsgs) => [...prevMsgs, message]);
      console.log('groupMessages', groupMessages);
      setSelectedRoom((prevRoom) => {
        return { ...prevRoom, hasNewMsg: !isChannelSelected };
      });
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
            setIsChannelSelected={setIsChannelSelected}
            setShowChannel={setShowChannel}
          />
        );
      case 'resign':
        return <Resign />;
      case 'reset':
        return <Reset />;
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
            setMessages={setMessages}
          />
        );
      case 'groupChat':
        return (
          <GroupChat
            selectedRoom={selectedRoom}
            groups={groups}
            setSelectedRoom={setSelectedRoom}
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
    tab.classList.toggle('hidden');
  };

  const handleAge = () => {
    if (!selectedAge) {
      setError('Veuillez entrer un age');
    } else if (selectedAge < 18) {
      setError('Age doit etre superieur a 18');
    } else {
      setError('');
      // setSelectedAge('');
      handleFilterChange('Age Max');
      setIsAgeModalOpen(false);
    }
  };

  const openInfoModal = () => {
    setIsInfoModalOpen(true);
    toggleMenu();
  };

  const openChat = (tab) => {
    setActiveTab('chat');
    // {
    //   selectedRoom &&
    //     setSelectedRoom((prevRoom) => {
    //       return { ...prevRoom, hasNewMsg: !isChannelSelected };
    //     });
    // }
    setIsChannelSelected(false);
    setSelectedUser(tab);
    setUsersSelected((prevUsers) =>
      prevUsers.map((item) =>
        item.userID === tab.userID ? { ...item, hasNewMsg: false } : item
      )
    );
  };

  const openGroupChat = () => {
    {
      selectedRoom &&
        setSelectedRoom((prevRoom) => {
          return { ...prevRoom, hasNewMsg: false };
        });
    }
    setShowChannel(true);
    setSelectedUser('');
    setActiveTab('groupChat');
    setIsChannelSelected(true);
  };

  const closeChat = (user) => {
    setSelectedUser('');
    setIsChannelSelected(false);
    setActiveTab('accueil');
    // setSelectedRoom((prevRoom) => {
    //   return { ...prevRoom, hasNewMsg: !isChannelSelected };
    // });
    setUsersSelected((prevItems) =>
      prevItems.filter((item) => item.userID !== user.userID)
    );
  };

  const closeGroupChat = () => {
    setShowChannel(false);
    setSelectedUser('');
    setActiveTab('accueil');
    setIsChannelSelected(false);
  };

  const changeTab = (tab) => {
    setSelectedUser(null);
    setActiveTab(tab);
    toggleMenu();
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeAgeModal = () => {
    setError('');
    setSelectedAge('');
    setIsAgeModalOpen(false);
    handleFilter();
  };

  const openAgeModal = () => {
    setIsAgeModalOpen(true);
    handleFilter();
    toggleMenu();
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const handleFilterChange = (filterInput) => {
    if (activeFilter.includes(filterInput)) {
      setActiveFilter((prevFilter) =>
        prevFilter.filter((item) => item !== filterInput)
      );
    } else {
      setActiveFilter((prevFilter) => [...prevFilter, filterInput]);
    }
    try {
      const response = axios.post('/api/update-user-filter', {
        filterData: filterInput,
        userID: user.userID,
      });
      console.log('User filter updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating user filter:', error);
    }
    socket.emit('updateUser', user.userID);
    handleFilter();
  };

  return (
    <section className='flex flex-1 justify-center bg-mediumBrown max-h-[70vh] md:max-h-[72vh]'>
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
                className='relative flex items-center px-4 space-x-2 font-bold border border-black py-1 bg-pastelPink hover:bg-pink-300'
                onClick={handleFilter}
              >
                <FaHeart />
                <span>Filtres</span>
              </button>
              <div
                ref={tabRef}
                id='filterTab'
                className='absolute flex flex-col w-36 right-5 px-2 py-6 bg-pastelPink rounded shadow-lg hidden'
              >
                <button
                  className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 focus:bg-slate-300 ${
                    activeFilter.includes('Bloquer nvx pv') && 'bg-slate-300'
                  }`}
                  onClick={() => handleFilterChange('Bloquer nvx pv')}
                >
                  Bloquer nvx pv
                </button>
                <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
                  Désactiver Bouclier
                </button>
                <button
                  className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 ${
                    activeFilter.includes('no mecs') && 'bg-slate-300'
                  }`}
                  onClick={() => handleFilterChange('no mecs')}
                >
                  no mecs
                </button>
                <div className='flex flex-col mb-2'>
                  <button
                    className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
                      isAgeModalOpen && 'bg-slate-300'
                    } ${activeFilter.includes('Age Max') && 'bg-slate-300'}`}
                    onClick={openAgeModal}
                  >
                    Age Max [ {selectedAge} ]
                  </button>
                </div>
                <button
                  className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
                    activeFilter.includes('pv du salon only') && 'bg-slate-300'
                  }`}
                  onClick={() => handleFilterChange('pv du salon only')}
                >
                  pv du salon only
                </button>
              </div>
              <button
                className={`font-bold bg-yellow-200 border border-black py-1 hover:bg-yellow-300
            ${activeTab === 'resign' && 'border-4 border-yellow-600'}`}
                // onClick={() => changeTab('resign')}
                onClick={openInfoModal}
              >
                Design
              </button>
              <button
                className={`font-bold bg-green-200 border border-black py-1 hover:bg-green-300
            ${activeTab === 'reset' && 'border-4 border-green-600'}`}
                // onClick={() => changeTab('reset')}
                onClick={openInfoModal}
              >
                Reset
              </button>
              <button
                className={`font-bold bg-slate-200 border border-black py-1 hover:bg-slate-300
            ${activeTab === 'profil' && 'border-4 border-slate-600'}`}
                onClick={openProfileModal}
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
                // onClick={() => changeTab('premium')}
                onClick={openInfoModal}
              >
                Premium
              </button>
              <button
                className={`font-bold bg-yellow-400 hover:bg-yellow-500 border border-black py-1
            ${activeTab === 'amiz' && 'border-4 border-yellow-700'}`}
                // onClick={() => changeTab('amiz')}
                onClick={openInfoModal}
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
              setSelectedRoom((prevRoom) => {
                return { ...prevRoom, hasNewMsg: prevRoom.hasNewMsg };
              });
            }}
          >
            Accueil
          </button>
          {usersSelected &&
            usersSelected?.map((tab, index) => (
              <div
                key={index}
                className={`items-center h-8 px-4 space-x-2 py-1 rounded-t-lg border border-black border-b-slate-100 
                  ${
                    selectedUser?.disconnected
                      ? 'bg-darkBlue border-b-zinc-600'
                      : selectedUser?.userID === tab.userID
                      ? 'bg-blue-300 '
                      : tab.hasNewMsg
                      ? 'bg-unseenYellow'
                      : 'bg-blue-200'
                  }
                `}
              >
                <button onClick={() => openChat(tab)}>{tab.pseudo}</button>
                <button className='text-xs' onClick={() => closeChat(tab)}>
                  <FaTimes />
                </button>
              </div>
            ))}
          {showChannel && (
            <div
              className={`bg-black items-center px-4 space-x-2 py-1 rounded-t-lg border border-black border-b-slate-100 ${
                isChannelSelected
                  ? 'bg-blue-300'
                  : selectedRoom.hasNewMsg
                  ? 'bg-unseenYellow'
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
          onClick={() => {
            setActiveTab('accueil');
            setSelectedUser('');
            setIsChannelSelected(false);
          }}
        >
          Accueil
        </button>
        <button
          className='relative flex items-center px-4 space-x-2 font-bold border border-black py-1 bg-pastelPink hover:bg-pink-300'
          onClick={handleFilter}
        >
          <FaHeart />
          <span>Filtres</span>
        </button>
        <div
          ref={tabRef}
          id='filterTab'
          className='absolute flex flex-col w-36 right-4 px-2 py-6 bg-pastelPink rounded shadow-lg hidden'
        >
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 focus:bg-slate-300 ${
              activeFilter.includes('Bloquer nvx pv') && 'bg-slate-300'
            }`}
            onClick={() => handleFilterChange('Bloquer nvx pv')}
          >
            Bloquer nvx pv
          </button>
          <button className='h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500'>
            Désactiver Bouclier
          </button>
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded mb-2 w-full hover:text-red-500 ${
              activeFilter.includes('no mecs') && 'bg-slate-300'
            }`}
            onClick={() => handleFilterChange('no mecs')}
          >
            no mecs
          </button>
          <div className='flex flex-col mb-2'>
            <button
              className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
                isAgeModalOpen && 'bg-slate-300'
              } ${activeFilter.includes('Age Max') && 'bg-slate-300'}`}
              onClick={openAgeModal}
            >
              Age Max
            </button>
          </div>
          <button
            className={`h-12 bg-slate-100 text-gray-800 rounded w-full hover:text-red-500 ${
              activeFilter.includes('pv du salon only') && 'bg-slate-300'
            }`}
            onClick={() => handleFilterChange('pv du salon only')}
          >
            pv du salon only
          </button>
        </div>
        <button
          className={`font-bold bg-yellow-200 border border-black py-1 hover:bg-yellow-300
            ${activeTab === 'resign' && 'border-4 border-yellow-600'}`}
          // onClick={() => setActiveTab('resign')}
          onClick={openInfoModal}
        >
          Design
        </button>
        <button
          className={`font-bold bg-green-200 border border-black py-1 hover:bg-green-300
            ${activeTab === 'reset' && 'border-4 border-green-600'}`}
          // onClick={() => setActiveTab('reset')}
          onClick={openInfoModal}
        >
          Reset
        </button>
        <button
          className={`font-bold bg-slate-200 border border-black py-1 hover:bg-slate-300
            ${activeTab === 'profil' && 'border-4 border-slate-600'}`}
          onClick={() => {
            setSelectedUser('');
            setIsChannelSelected(false);
            setIsProfileModalOpen(true);
          }}
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
          // onClick={() => setActiveTab('premium')}
          onClick={openInfoModal}
        >
          Premium
        </button>
        <button
          className={`font-bold bg-yellow-400 hover:bg-yellow-500 border border-black py-1
            ${activeTab === 'amiz' && 'border-4 border-yellow-700'}`}
          // onClick={() => setActiveTab('amiz')}
          onClick={openInfoModal}
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
            left: '50%',
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
            Cette option est en cours de développement.
            {/* vous n etes pas membre{' '}
            <span className='bg-yellow-100 text-green-500'>Premium</span> sur ce
            complte ou alors celui a expire */}
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
              onChange={(e) => setSelectedAge(e.target.value)}
            />
          </div>
          <div className='text-center text-white text-sm mt-2'>{error}</div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={handleAge}
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
      <Modal
        isOpen={isProfileModalOpen}
        className='fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-black'
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-lightBrown p-3'>
          <Profil />
          <div className='flex space-x-6 mt-8 justify-end'>
            {/* <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={handleAge}
            >
              Confirmer
            </button> */}
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={() => setIsProfileModalOpen(false)}
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
