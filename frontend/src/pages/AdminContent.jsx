import React, { useEffect, useState } from 'react';
import ChannelsTable from '../components/Admin/ChannelsTable';
import UsersTable from '../components/Admin/UsersTable';
import { useAppSelector } from '../store/store';
import { useNavigate } from 'react-router-dom';

const AdminContent = () => {
  const [contentType, setContentType] = useState('channels');
  const user = useAppSelector((state) => state.user.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (!user || user?.role !== 'admin') {
  //     navigate('/login');
  //   }
  // }, [user, navigate]);

  // if (!user) {
  //   return;
  // }

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const changeContent = () => {
    if (contentType === 'channels') {
      setContentType('users');
    } else if (contentType === 'users') {
      setContentType('channels');
    }
  };

  const openAddModal = () => {
    setIsModalOpen(true);
    setModalType('addChannel');
  };

  return (
    <div className='bg-lightBrown h-screen overflow-y-auto'>
      <div className='max-w-5xl mx-auto p-20'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold capitalize'>{contentType}</h1>
          <div className='flex space-x-4'>
            {contentType === 'channels' && (
              <button
                className='bg-brown text-white px-4 py-2 shadow-md rounded-lg'
                onClick={openAddModal}
              >
                Add Channel
              </button>
            )}
            <button
              className='bg-brown text-white px-4 py-2 shadow-md rounded-lg'
              onClick={changeContent}
            >
              {contentType === 'channels' ? 'Users Table' : 'Channels Table'}
            </button>
          </div>
        </div>
        {/*ta\ble  */}
        {contentType === 'channels' ? (
          <ChannelsTable
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            modalType={modalType}
            setModalType={setModalType}
          />
        ) : (
          <UsersTable />
        )}
      </div>
    </div>
  );
};

export default AdminContent;
