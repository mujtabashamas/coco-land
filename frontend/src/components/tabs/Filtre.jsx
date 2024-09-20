import React, { useState, useEffect, useRef } from 'react';
import { FaHeart } from 'react-icons/fa';
import Modal from 'react-modal';
import { getSocket } from '../../socket/socket';
import axios from 'axios';
import { useAppSelector } from '../../store/store';

const Filtre = ({ showMenu, activeFilter, setActiveFilter }) => {
  const user = useAppSelector((state) => state.user.user);
  const [isChannelSelected, setIsChannelSelected] = useState(false);
  const [usersSelected, setUsersSelected] = useState([]);
  const tabRef = useRef(null);
  const [selectedAge, setSelectedAge] = useState('');
  const [isAgeModalOpen, setIsAgeModalOpen] = useState(false);
  const [error, setError] = useState('');
  const socket = getSocket();

  // useEffect(() => {
  //   const updateUser = (userID) => {
  //     setUsersSelected((prevUsers) =>
  //       // if user then turn userExists to false
  //       prevUsers.map((item) => {
  //         if (item.userID === userID) {
  //           return { ...item, disconnected: true };
  //         } else {
  //           return item;
  //         }
  //       })
  //     );
  //     if (selectedUser?.userID === userID) {
  //       setSelectedUser((prevUser) => {
  //         return { ...prevUser, disconnected: true };
  //       });
  //     }
  //   };
  //   socket.on('userDisconnected', updateUser);
  //   socket.on('reconnected', updateUser);

  //   return () => {
  //     socket.off('userDisconnected');
  //     socket.off('reconnected');
  //   };
  // });

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

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const closeAgeModal = () => {
    setError('');
    setSelectedAge('');
    setIsAgeModalOpen(false);
  };

  const openAgeModal = () => {
    setIsAgeModalOpen(true);
    handleFilter();
    toggleMenu();
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
    <section>
      {/* center container */}

      {/* right container */}
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
    </section>
  );
};

export default Filtre;
