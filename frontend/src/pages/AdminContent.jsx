import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/store';
import ChannelsTable from '../components/Admin/ChannelsTable';
import UsersTable from '../components/Admin/UsersTable';

const AdminContent = () => {
  const user = useAppSelector((state) => state.user.user);
  const [contentType, setContentType] = useState('channels');

  useEffect(() => {
    if (user?.role && user.role !== 'admin') {
      window.location.href = '/login';
    }
  });
  const changeContent = () => {
    if (contentType === 'channels') {
      setContentType('users');
    } else if (contentType === 'users') {
      setContentType('channels');
    }
  };

  return (
    <div className='bg-lightBrown h-screen overflow-y-auto'>
      <div className='max-w-5xl mx-auto p-20'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold capitalize'>{contentType}</h1>
          <div className='flex space-x-4'>
            {contentType === 'channels' && (
              <button className='bg-brown text-white px-4 py-2 shadow-md rounded-lg '>
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
        {contentType === 'channels' ? <ChannelsTable /> : <UsersTable />}
      </div>
    </div>
  );
};

export default AdminContent;
