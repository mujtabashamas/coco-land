import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useAppSelector } from '../../store/store';
import Modal from 'react-modal';
import { getSocket } from '../../socket/socket';
import axios from 'axios';

const ChannelsTable = ({
  modalType,
  setModalType,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [showUserDetailsModel, setShowUserDetailsModel] = useState(false);
  const [updateChannelId, setUpdateChannelId] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const user = useAppSelector((state) => state.user.user);
  const [showMoreUsers, setShowMoreUsers] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [userDetails, setUserDetails] = useState(null);
  const [channels, setChannels] = useState(null);
  const socket = getSocket();
  const [update, setUpdate] = useState(false);

  useEffect(() => {
    async function fetchChannels() {
      const res = await axios.get('/api/getChannels');
      setChannels(res.data);
    }

    fetchChannels();
  }, [update]);

  const addChannel = async (channelId, admin) => {
    try {
      const res = await axios.post('/api/addChannel', {
        channelId,
        admin,
      });
      setUpdate((prev) => !prev);
    } catch (error) {
      console.log(error);
    }
  };

  const updateChannel = async (channelId, newChannelName) => {
    try {
      const res = await axios.post(`/api/updateChannel`, {
        channelId,
        newChannelName,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const deleteChannel = async (channelId) => {
    try {
      const res = await axios.delete(`/api/deleteChannel/${channelId}`);
    } catch (error) {
      // console.log(error);
    }
  };

  const handleChannelNameChange = (e) => {
    const name = e.target.value;
    setNewChannelName(name);
    const exists = channels.some((channel) => channel.channelId === name);
    setErrorMessage(exists ? 'Channel already exists' : '');
  };

  const openEditModal = (channelId) => {
    setUpdateChannelId(channelId);
    setIsModalOpen(true);
    setModalType('editChannel');
  };

  const openUserDetailsModel = (user) => {
    setUserDetails(user);
    setShowUserDetailsModel(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newChannelName === '') {
      setErrorMessage('Channel name is required');
      return;
    }

    if (modalType === 'addChannel') {
      // call api for adding channel
      addChannel(newChannelName, user);
      // socket.emit('addChannel', newChannelName, user);
      // socket.off('addChannel');
    } else if (modalType === 'editChannel') {
      updateChannel(updateChannelId, newChannelName);
    }
    setNewChannelName('');
    setModalType('');
    setIsModalOpen(false);
  };

  const handleDelete = async (id) => {
    deleteChannel(id);
  };

  const removeUser = (e) => {
    e.preventDefault();
    socket.emit('removeUser', userDetails);
    socket.off('removeUser');
    setShowUserDetailsModel(false);
  };

  const toggleShowMoreUsers = (channelId) => {
    setShowMoreUsers((prevState) => ({
      ...prevState,
      [channelId]: !prevState[channelId],
    }));
  };

  return (
    <div>
      <table className='min-w-full bg-white border border-black rounded'>
        <thead>
          <tr className='bg-gray-200'>
            <th className='py-2 px-4 border-b'>ID</th>
            <th className='py-2 px-4 border-b'>ChannelName</th>
            <th className='py-2 px-4 border-b'>Users</th>
            <th className='py-2 px-4 border-b'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {channels &&
            channels.map((channel, index) => (
              <tr key={index} className='text-center'>
                <td className='py-2 px-4 border-b'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>{channel.channelId}</td>
                <td className='py-2 px-4 border-b'>
                  {channel.users?.length}
                  {/* <div className='flex flex-wrap max-w-lg items-center'> */}
                  {/* {channel.users?.length > 0 &&
                        channel.users
                          .slice(0, showMoreUsers[channel.id] ? undefined : 3)
                          .map((user, index) => (
                            <div
                              key={index}
                              className='flex w-full md:w-1/2 lg:w-1/3 xl:w-1/4 justify-center space-x-1 items-center'
                              onClick={() => openUserDetailsModel(user)}
                            >
                              <p className='truncate min-w-[10ch]'>
                                {user.pseudo}
                              </p>
                            </div>
                          ))}
                    </div>
                    {channel.users?.length > 3 && (
                      <button
                        onClick={() => toggleShowMoreUsers(channel.id)}
                        className='text-blue-500 underline'
                      >
                        {showMoreUsers[channel.id] ? 'Show Less' : 'Show More'}
                      </button>
                    )} */}
                </td>
                <td className='py-2 px-4 border-b'>
                  <button
                    className='bg-blue-500 text-white px-2 py-1 rounded mr-2'
                    onClick={() => openEditModal(channel.channelId)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className='bg-red-500 text-white px-2 py-1 rounded'
                    onClick={() => handleDelete(channel.channelId)}
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <Modal
        isOpen={isModalOpen}
        style={{
          content: {
            top: '50%',
            left: '50%',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '0px',
            border: '2px solid black',
          },
        }}
        ariaHideApp={false}
      >
        <div className='bg-lightBrown p-3'>
          <h4 className='text-2xl text-center font-semibold'>
            {modalType === 'addChannel' ? 'Add' : 'Edit'} Channel
          </h4>
          <div className='mt-6 flex flex-col justify-between mx-6 space-x-8'>
            <input
              type='text'
              value={newChannelName}
              onChange={(e) => handleChannelNameChange(e)}
              placeholder='Enter channel Name'
              className='px-6 py-2 border border-black rounded-xl w-full focus:outline-none'
            />
            {errorMessage && (
              <div className='text-white mt-1'>{errorMessage}</div>
            )}
          </div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-green-200 hover:bg-green-300 text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={(e) => handleSubmit(e)}
            >
              {modalType === 'addChannel' ? 'Create' : 'Edit'}
            </button>
            <button
              className='bg-red-200 hover:bg-red-300 text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={showUserDetailsModel}
        style={{
          content: {
            top: '50%',
            left: '50%',
            bottom: 'auto',
            transform: 'translate(-50%, -50%)',
            width: '400px',
            padding: '0px',
            border: '2px solid black',
          },
        }}
        ariaHideApp={false}
      >
        <div className='bg-lightBrown p-3'>
          <h4 className='text-2xl text-center font-semibold'>User Details</h4>
          <div className='mt-6 flex flex-col mx-6 '>
            <div className='flex space-x-4'>
              <h4 className='text-black font-bold'>Pseudo: </h4>
              <span className='text-white'> {userDetails?.pseudo}</span>
            </div>
            <div className='flex space-x-4'>
              <h4 className='text-black font-bold'>Genre: </h4>
              <span className='text-white'>{userDetails?.genre}</span>
            </div>
            <div className='flex space-x-4'>
              <h4 className='text-black font-bold'>PostalCode: </h4>
              <span className='text-white'> {userDetails?.postalcode}</span>
            </div>
            <div className='flex space-x-4'>
              <h4 className='text-black font-bold'>Place: </h4>
              <span className='text-white'>{userDetails?.place}</span>
            </div>
            {userDetails?.status && (
              <div className='flex space-x-4'>
                <h4 className='text-black font-bold'>Status: </h4>
                <span className='text-white'>{userDetails?.status}</span>
              </div>
            )}
          </div>
          <div className='flex space-x-6 mt-8 justify-end'>
            <button
              className='bg-red-400 hover:bg-green-300 text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={(e) => removeUser(e)}
            >
              Remove
            </button>
            <button
              className='bg-red-200 hover:bg-red-300 text-brown px-3 py-2 rounded-xl font-semibold border border-black shadow-xl shadow-brown'
              onClick={() => setShowUserDetailsModel(false)}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChannelsTable;
