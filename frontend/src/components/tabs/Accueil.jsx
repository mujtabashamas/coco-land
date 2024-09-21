import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import Modal from 'react-modal';
import { getSocket } from '../../socket/socket';
import axios from 'axios';

const Accueil = ({
  setActiveTab,
  setSelectedUser,
  usersSelected,
  setUsersSelected,
  groups,
  setGroups,
  setSelectedRoom,
  selectedRoom,
  setGroupMessages,
  box,
  setBox,
  setIsChannelSelected,
  setShowChannel,
}) => {
  const [isGenreModalOpen, setIsGenreModalOpen] = useState(false);
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [refresh, setRefresh] = useState(false);
  // const [chosenRoom, setChosenRoom] = useState(null);
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [enterMessage, setEnterMessage] = useState('');
  const socket = getSocket();

  const user = useAppSelector((state) => state.user.user);

  // scrollIntoView
  useEffect(() => {
    if (box !== '') {
      const section = document.getElementById(box);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        setBox('');
      }
    }
  }, [box]);

  // fetch users from the server every 5 seconds
  let gettingData = false;
  useEffect(() => {
    async function fetchData() {
      if (gettingData) return;
      gettingData = true;
      try {
        const res = await fetch('/api/getUsers');
        const data = await res.json();
        setUsers(data);

        const res2 = await fetch('/api/getChannels');
        const data2 = await res2.json();
        setGroups(data2);
      } catch (err) {
        console.log(err);
      }
      gettingData = false;
    }

    // setInterval(() => {
    //   fetchData();
    // }, 1000 * 10);

    fetchData();
  }, [refresh]);

  // listen for an socket refresh and update state refresh
  useEffect(() => {
    socket.on('refresh', () => {
      console.log('Refreshed');
      setRefresh(!refresh);
    });

    return () => {
      socket.off('refresh');
    };
  }, []);

  const filteredData = users?.filter((item) => {
    const userPrefix = user.postalcode.substring(0, 2);
    const postalCodePrefix = item.postalcode.substring(0, 2);

    const isAgeInRange =
      (!minAge || item.age >= parseInt(minAge)) &&
      (!maxAge || item.age <= parseInt(maxAge));

    return (
      item.userID !== user.userID &&
      (!selectedGenre || item.genre === selectedGenre) &&
      isAgeInRange &&
      postalCodePrefix === userPrefix
    );
  });

  const selectUser = (userID) => {
    const u = users.find((item) => item.userID === userID);
    setIsChannelSelected(false);
    setActiveTab('chat');
    setSelectedUser(u);
    setUsersSelected((prevItem) =>
      prevItem.includes(u.userID) ? prevItem : [...prevItem, u]
    );
  };

  const selectGroup = async (groupID) => {
    const group = groups.find((item) => item.channelId === groupID);
    // if user not in group
    if (selectedRoom.channelId !== groupID) {
      // group which user can't join
      if (
        (groupID === '18-25 ans' && (user.age < 18 || user.age > 25)) ||
        (groupID === 'Gay' && user.genre === 'Femme') ||
        (groupID === 'Lesbiennes' && user.genre === 'Homme')
      ) {
        setEnterMessage(`You are not allowed to join this group`);
        setIsEnterModalOpen(true);
        return;
      }
      // groups which user can join
      else {
        // if user is in any prev group
        if (selectedRoom.channelId) {
          // remove user from prev group
          try {
            const res = await axios.post('/api/remove-user', {
              channelId: selectedRoom.channelId,
              userID: user.userID,
            });
            if (res.status === 200) {
              console.log(
                `User ${user.pseudo} removed from group ${selectedRoom.channelId}`
              );
            }
          } catch (err) {
            console.log(err);
          }
          // socket.emit(
          //   'removeUserFromChannel',
          //   (selectedRoom.channelId, user.userID)
          // );
        }
        // join new groupy
        try {
          const res2 = await axios.post('/api/join-channel', {
            channelId: groupID,
            userID: user.userID,
          });
          if (res2.status === 200) {
            console.log('User joined the group');
          }
        } catch (err) {
          console.log(err);
        }
        setGroupMessages([]);
      }
    }

    setSelectedRoom({ ...group, hasNewMessages: false });
    setActiveTab('groupChat');
    setIsChannelSelected(true);
    setSelectedUser('');
    setShowChannel(true);
    socket.emit('updateChannel', groupID);
  };

  // const openEnterModal = (groupID) => {
  //   const group = groups.find((item) => item.channelId === groupID);
  //   // if not in group
  //   if (!group.users.find((item) => item.userID === user.userID)) {
  //     // group limit full
  //     if (group.users.length >= 60) {
  //       setIsEnterModalOpen(true);
  //     }
  //     if (group.channelId === '18-25 ans') {
  //       if (user.age < 18 || user.age > 25) {
  //         setEnterMessage(`You are not allowed to join this group`);
  //         return;
  //       }
  //     }
  //     if (group.channelId === 'Gay' && user.genre === 'Femme') {
  //       setEnterMessage('Seul un homme peut rejoindre ce groupe');
  //       return;
  //     }
  //     if (group.channelId === 'Lesbiennes' && user.genre === 'Homme') {
  //       setEnterMessage('Seules les femmes peuvent rejoindre ce groupe');
  //       return;
  //     }
  //     setIsEnterModalOpen(true);

  //     console.log('returned');
  //     // if in group
  //   } else {
  //     setSelectedRoom(group);
  //     setActiveTab('groupChat');
  //   }
  // };

  // const closeEnterModal = () => {
  //   setEnterMessage('');
  //   setIsEnterModalOpen(false);
  // };

  // const openEnterModal = async (groupID) => {
  //   if (selectedRoom) {
  //     if (selectedRoom.channelId !== groupID) {
  //       const res = axios.post('/api/remove-user', {
  //         channelId: selectedRoom.channelId,
  //         userID: user.userID,
  //       });
  //       if (res.status === 200) {
  //         console.log('User removed from group');
  //       }
  //       joinGroup(groupID);
  //     } else {
  //       setActiveTab('groupChat');
  //       setIsChannelSelected(true);
  //       setShowChannel(true);
  //       setSelectedUser('');
  //     }
  //   }
  // };

  // const joinGroup = async (channelId) => {
  //   const channel = groups.find((item) => item.channelId === channelId);
  //   if (!channel.users.includes(user.userID)) {
  //     const res = await axios.post('/api/join-channel', {
  //       channelId,
  //       userID: user.userID,
  //     });
  //     if (res.status === 200) {
  //       console.log('User joined the group');
  //     }
  //   }

  //   setSelectedRoom(channel);
  //   setActiveTab('groupChat');
  //   setIsChannelSelected(true);

  //   setSelectedUser('');
  //   setGroupMessages([]);
  //   setShowChannel(true);
  //   socket.emit('updateChannel', channelId);
  // };

  const handleGenreSubmit = () => {
    if (selectedGenre) {
      setIsGenreModalOpen(false);
      setError('');
    } else {
      setError('Veuillez sélectionner un genre.');
    }
  };

  const handleAgeSubmit = () => {
    if (!minAge || !maxAge) {
      setError(`Veuillez entrer l'âge minimum et maximum`);
      return;
    } else {
      if (minAge > maxAge) {
        setError(`L'âge minimum doit être inférieur à l'âge maximum`);
        return;
      } else {
        if (minAge >= 18 && maxAge <= 100) {
          setIsAgeModalOpen(false);
          setError('');
        } else {
          setError('Veuillez entrer un âge compris entre 18 et 100 ans');
        }
      }
    }
  };

  const showAllAge = () => {
    setMinAge('');
    setMaxAge('');
    setError('');
    setIsAgeModalOpen(false);
  };

  const showAllGenre = () => {
    setSelectedGenre('');
    setError('');
    setIsGenreModalOpen(false);
  };

  const closeAgeModal = () => {
    setError('');
    setIsAgeModalOpen(false);
  };

  const closeGenreModal = () => {
    setError('');
    setIsGenreModalOpen(false);
  };

  return (
    <div className='h-full overflow-y-auto custom-scrollbar'>
      <div className='flex flex-col lg:flex-row-reverse lg:justify-between space-y-14 xl:space-y-0 px-8 xl:px-0'>
        {/* right box */}
        <div
          id='users-online'
          className='w-full lg:w-1/2 xl:w-1/2 2xl:w-[27rem] overflow-y-auto custom-scrollbar'
        >
          <div className='mt-2 flex flex-col space-y-2 '>
            <div className='flex justify-between items-center px-4 py-2'>
              <button
                className='text-xl space-x-1'
                onClick={() => setIsGenreModalOpen(true)}
              >
                <span className='font-bold'>Genre: </span>
                <span className='font-semibold'>{selectedGenre || 'Tous'}</span>
              </button>
              <button
                className='text-xl space-x-1'
                onClick={() => setIsAgeModalOpen(true)}
              >
                <span className='font-bold'>Age:</span>
                <span className='font-semibold'>
                  {minAge && maxAge ? `${minAge}-${maxAge}` : 'Tous'}
                </span>
              </button>
              <button className='text-xl font-bold'>Pseudo</button>
            </div>

            <div className='flex flex-col bg-darkLilac overflow-y-auto  border border-black custom-scrollbar'>
              {filteredData?.length > 0 ? (
                filteredData?.map((user, index) => (
                  <div
                    key={index}
                    className={`flex justify-between border border-black px-4 hover:bg-lightLilac ${
                      user.genre === 'Femme' && 'bg-pinkRose'
                    }`}
                    onClick={() => selectUser(user.userID)}
                  >
                    <span className='font-bold w-2/6'>{user.pseudo}</span>
                    <span className='font-bold'>{user.age}</span>
                    <span className='font-bold w-3/6'>{user.place}</span>
                  </div>
                ))
              ) : (
                <div className='flex py-6 w-full justify-center text-center'>
                  <h4 className=' text-red-500 font-bold text-xl'>
                    Aucun utilisateur en ligne
                  </h4>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* left box */}
        <div className='w-full lg:w-2/5 xl:w-1/2 2xl:w-[24rem]'>
          <div className='mt-20'>
            <div
              id='channels'
              className='bg-lilac border border-black mx-auto xl:mx-10 h-full custom-scrollbar overflow-y-auto'
            >
              <div className='px-8 pb-4 w-full'>
                <div className='flex font-bold '>Liste des salons publics</div>
                {groups &&
                  groups?.map((group, index) => (
                    <div
                      key={index}
                      className={`flex justify-between font-semibold hover:bg-lightLilac cursor-pointer ${
                        group.users?.length > 10 && 'bg-lightLilac text-red-500'
                      }`}
                      onClick={() => selectGroup(group.channelId)}
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
      <Modal
        isOpen={isGenreModalOpen}
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
            Genre
          </h4>
          <div className='mt-6 flex justify-between mx-6 space-x-8'>
            <label className='flex items-center text-xl font-bold text-2xl'>
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
          <div className='text-sm text-white text-center'>{error}</div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={showAllGenre}
            >
              Afficher tout
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={handleGenreSubmit}
            >
              Confirmer
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={closeGenreModal}
            >
              Fermer
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
              onChange={(e) => setMinAge(e.target.value)}
            />
            <input
              type='number'
              name='age'
              className={`font-semibold text-xl focus:outline-none rounded shadow-xl appearance-none w-12 p-1 border`}
              onChange={(e) => setMaxAge(e.target.value)}
            />
          </div>
          <div className='text-center text-white text-sm mt-2'>{error}</div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={showAllAge}
            >
              Afficher tout
            </button>
            <button
              className='bg-white text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown hover:bg-gray-200'
              onClick={handleAgeSubmit}
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
        isOpen={isEnterModalOpen}
        className='top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 w-[300px] p-0 border-2 border-black relative bg-white rounded-md' // Style for the modal content
        overlayClassName='fixed inset-0 bg-black bg-opacity-50' // Style for the overlay with opacity
        // overlayClassName='bg-opacity-50'
        ariaHideApp={false} // Disables ARIA hiding
      >
        <div className='bg-tabColor p-3'>
          {/* { enterMessage ? ( */}
          <div>
            <h4 className='text-lg'>{enterMessage}</h4>
            <div className='flex justify-end'>
              <button
                className='bg-green-200 px-2 py-1 rounded-xl shadow-lg border border-black'
                onClick={() => setIsEnterModalOpen(false)}
              >
                Ok
              </button>
            </div>
          </div>
          {/* // ) : ( */}
          {/* //   <div> */}
          {/* //     <h2 className='text-xl font-bold'> */}
          {/* //       Êtes-vous sûr de vouloir accéder à cette chaîne */}
          {/* //     </h2> */}
          {/* //     <div className='flex justify-end space-x-4 my-2'> */}
          {/* //       <button */}
          {/* //         className='bg-red-200 px-2 py-1 rounded-xl shadow-sm shadow-green-100 border border-black' */}
          {/* //         onClick={closeEnterModal} */}
          {/* //       > */}
          {/* //         NO */}
          {/* //       </button> */}
          {/* //       <button */}
          {/* //         className='bg-green-200 px-2 py-1 rounded-xl shadow-sm shadow-green-100 border border-black' */}
          {/* //         onClick={() => joinGroup()} */}
          {/* //       > */}
          {/* //         YES */}
          {/* //       </button> */}
          {/* //     </div> */}
          {/* //   </div> */}
          {/* // )} */}
        </div>
      </Modal>
    </div>
  );
};

export default Accueil;
