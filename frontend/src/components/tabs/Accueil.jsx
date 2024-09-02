import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import socket from '../../socket/socket';
import Modal from 'react-modal';
import axios from 'axios';
import { FaTimes } from 'react-icons/fa';
Modal.setAppElement('#root');

const Accueil = ({
  setActiveTab,
  setSelectedUser,
  usersSelected,
  setUsersSelected,
  groups,
  setGroups,
  setSelectedRoom,
  setRoomsSelected,
  selectedRoom,
  roomsSelected,
  groupMessages,
  setGroupMessages,
}) => {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAge, setSelectedAge] = useState('');
  const [users, setUsers] = useState([]);
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);

  const user = useAppSelector((state) => state.user.user);

  useEffect(() => {
    socket.emit('requestUsers');
    socket.on('updateUserList', (users) => {
      setUsers(users);
    });
    return () => {
      socket.off('updateUserList');
    };
  }, []);

  useEffect(() => {
    socket.emit('requestChannels');
    // const handleUserChannels = (group) => {
    //     console.log('Received channel data: ', group);
    //     if (group) {
    //         setGroups(prevGroups => [...prevGroups, group]);
    //     }
    // };

    socket.on('userChannels', (channels) => {
      setGroups(channels);
    });

    return () => {
      socket.off('userChannels');
    };
  }, []);

  const filteredData = users?.filter((item) => {
    const userPrefix = user.postalcode.substring(0, 2);
    // Extract the first 2 digits from each user's postal code
    const postalCodePrefix = item.postalcode.substring(0, 2);

    return (
      item.id !== user.id &&
      (!selectedGenre || item.genre === selectedGenre) &&
      (!selectedAge || item.age === parseInt(selectedAge)) &&
      postalCodePrefix === userPrefix
    );
  });

  const selectUser = (user) => {
    setActiveTab('chat');
    setSelectedUser(user);
    const userExist = usersSelected.some((item) => item.id === user.id);
    if (!userExist) {
      setUsersSelected((prevItems) => [...prevItems, user]);
    }
  };

  const openEnterModal = (group) => {
    groups.map((channel) => {
      if (channel.channelId === group.channelId) {
        setSelectedRoom(channel);
        // if user does not exist
        // const exists = .some(obj => obj.id === objToCheck.id && obj.name === objToCheck.name);
        if (!channel.users.find((item) => item.id === user.id)) {
          setIsEnterModalOpen(true);
        } else {
          // if user exist
          setActiveTab('groupChat');
          const roomExist = roomsSelected.some(
            (item) => item.channelId === group.channelId
          );
          if (!roomExist) {
            setRoomsSelected((prevItems) => [...prevItems, group]);
          }
        }
      }
    });
  };

  const closeEnterModal = () => {
    setIsEnterModalOpen(false);
    setSelectedRoom('');
    console.log('setselectroom accueil2', selectedRoom);
  };

  const joinGroup = () => {
    const updatedGroup = groups.map((group) =>
      group.channelId === selectedRoom.channelId
        ? { ...group, users: [...group.users, user] }
        : group
    );
    console.log('updategroup', updatedGroup);
    setActiveTab('groupChat');
    setGroups(updatedGroup);
    updatedGroup.map((gr) => {
      if (gr.channelId === selectedRoom.channelId) {
        setSelectedRoom(gr);
      }
    });
    setGroupMessages((prevGroup) => {
      return {
        ...prevGroup,
        [selectedRoom.channelId]: [],
      };
    });
    console.log('groupmesg from accueil when joining', groupMessages);
    setRoomsSelected((prevItem) => [...prevItem, selectedRoom]);
    socket.emit('joinChannel', selectedRoom.channelId, user);
    console.log('index given', selectedRoom.channelId);
  };

  // const group = {id:1, name:'hello'};
  // setSelectedRoom(group)
  // console.log('selctedroom', selectedRoom)
  // setSelectedRoom({id:1, name:'te'})
  const selectGroupRoom = (group) => {
    setActiveTab('groupChat');
    groups.map((gr) => {
      if (gr.channelId === group.channelId) {
        setSelectedRoom(gr);
        console.log('setselectroom  accueil3', selectedRoom);
      }
    });
    setRoomsSelected((prevGroup) => {
      const groupExists = prevGroup.some((g) => g.id === group.id); // Assuming groups have a unique 'id'
      if (!groupExists) {
        return [...prevGroup, group];
      }
      return prevGroup;
    });
  };

  const handleGenreSubmit = () => {
    if (selectedGenre) {
      setIsGenreModalOpen(false);
    } else {
      alert('Please select a genre.');
    }
  };

  const handleAgeSubmit = () => {
    if (selectedAge && selectedAge >= 18) {
      setIsAgeModalOpen(false);
    } else {
      alert('Please enter age above 18');
    }
  };

  // const handleCreateGroup = () => {
  //     if (!groupName) {
  //         alert('please enter a group name');
  //     } else {
  //         const alxlroupUsers = [...groupUsers, user];
  //         socket.emit('joinChannel', groupName, alxlroupUsers, user)
  //         setGroupUsers([]);
  //         setGroupName('');
  //         setIsCreateGroupModalOpen(false)
  //     }
  // }

  return (
    <div className='h-full overflow-y-auto custom-scrollbar'>
      {filteredData.length > 0 ? (
        <div className='flex flex-col xl:flex-row-reverse xl:justify-between space-y-20 xl:space-y-0 overflow-y-auto px-8 xl:px-0'>
          {/* right box */}
          <div className='w-full xl:w-1/2 2xl:w-[27rem]'>
            <div className='mt-2 flex flex-col space-y-2 '>
              <div className='flex justify-between items-center px-4 py-2'>
                <button
                  className='text-xl'
                  onClick={() => setIsGenreModalOpen(true)}
                >
                  <span className='font-bold'>Genre: </span>
                  <span className='font-semibold'>
                    {selectedGenre || 'All'}
                  </span>
                </button>
                <button
                  className='text-xl'
                  onClick={() => setIsAgeModalOpen(true)}
                >
                  <span className='font-bold'>Age:</span>
                  <span className='font-semibold'>{selectedAge || 'All'}</span>
                </button>
                <button className='text-xl font-bold'>{user.pseudo}</button>
              </div>

              <div className='flex flex-col bg-darkLilac overflow-y-auto  border border-black custom-scrollbar'>
                {filteredData?.map((user, index) => (
                  <div
                    key={index}
                    className={`flex justify-between border border-black px-4 hover:bg-lightLilac ${
                      user.genre === 'Femme' && 'bg-pinkRose'
                    }`}
                    onClick={() => selectUser(user)}
                  >
                    <span className='font-bold w-2/6'>{user.pseudo}</span>
                    <span className='font-bold w-1/6'>{user.age}</span>
                    <span className='font-bold w-3/6'>{user.place}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* left box */}
          <div className='w-full xl:w-1/2 2xl:w-[24rem]'>
            <div className=''>
              <div className='bg-lilac border border-black mx-auto xl:mx-10 custom-scrollbar xl:overflow-y-auto'>
                <div className='px-8 pb-4 w-full'>
                  {/* <div 
                                    className='flex border bg-blue-200 border-black hover:bg-lightLilac justify-center'
                                >
                                    <span 
                                        className='font-bold'
                                        onClick={() => setIsCreateGroupModalOpen(true)}
                                    >
                                        Create Group
                                    </span>
                                </div> */}
                  <div className='flex font-bold'>Lists des salons publice</div>
                  {groups &&
                    groups?.map((group, index) => (
                      <div
                        key={index}
                        className={`flex justify-between font-semibold hover:bg-lightLilac cursor-pointer ${
                          group.users?.length > 10 &&
                          'bg-lightLilac text-red-500'
                        }`}
                        onClick={() => openEnterModal(group)}
                      >
                        <h1>{group.channelId}</h1>
                        <p>{group.users?.length}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex justify-center mt-10 text-red-500 text-xl font-bold'>
          No users online
        </div>
      )}
      <Modal
        isOpen={isGenreModalOpen}
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
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-lightBrown p-3'>
          <h4 className='text-2xl text- 3xl:w-1/3center font-semibold text-white'>
            Select Genre
          </h4>
          <div className='mt-6 flex justify-between mx-6 space-x-8'>
            <label className='flex items-center text-xl font-bold text-2xl'>
              3xl:w-1/3{' '}
              <input
                type='radio'
                name='genre'
                value='Homme'
                className='mr-2 w-5 h-5'
                checked={selectedGenre === 'Homme'}
                onChange={(e) => setSelectedGenre(e.target.value)}
              />
              Homme
            </label>
            <label className='flex items-center text-xl font-bold text-2xl'>
              3xl:w-1/3{' '}
              <input
                type='radio'
                name='genre'
                value='Femme'
                className='mr-2 w-5 h-5'
                checked={selectedGenre === 'Femme'}
                onChange={(e) => setSelectedGenre(e.target.value)}
              />
              Femme
            </label>
          </div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={handleGenreSubmit}
            >
              Submit
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={() => setIsGenreModalOpen(false)}
            >
              Close
            </button>
          </div>
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
            width: '400px',
            padding: '0px',
            border: '2px solid black', // Adjust width for a smaller modal
          },
        }}
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-lightBrown p-3'>
          <h4 className='text-2xl text- 3xl:w-1/3center font-semibold text-white'>
            Select Age
          </h4>
          <div className='mt-6 flex items-center justify-center'>
            <input
              type='number'
              name='age'
              className={`font-semibold text-xl appearance-none w-12 p-1 border`}
              onChange={(e) => setSelectedAge(e.target.value)}
            />
          </div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={handleAgeSubmit}
            >
              Submit
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={() => setIsGenreModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isEnterModalOpen}
        className='top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-[400px] p-0 border-2 border-black relative bg-white rounded-md' // Style for the modal content
        overlayClassName='fixed inset-0 bg-black bg-opacity-50' // Style for the overlay with opacity
        // overlayClassName='bg-opacity-50'
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-tabColor p-3'>
          <h2 className='text-xl font-bold'>
            Êtes-vous sûr de vouloir accéder à cette chaîne
          </h2>
          <div className='flex justify-end space-x-4 my-2'>
            <button
              className='bg-red-200 px-2 py-1 rounded-xl shadow-sm shadow-green-100 border border-black'
              onClick={() => closeEnterModal()}
            >
              NO
            </button>
            <button
              className='bg-green-200 px-2 py-1 rounded-xl shadow-sm shadow-green-100 border border-black'
              onClick={() => joinGroup()}
            >
              YES
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Accueil;
