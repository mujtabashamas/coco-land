import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useAppSelector } from '../../store/store';
import { getSocket } from '../../socket/socket';

const UsersTable = () => {
  const user = useAppSelector((state) => state.user.user);
  const [users, setUsers] = useState(null);
  const socket = getSocket();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/getUsers');
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.log(err);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div>
      <table className='min-w-full bg-white border border-black rounded'>
        <thead>
          <tr className='bg-gray-200'>
            <th className='py-2 px-4 border-b'>ID</th>
            <th className='py-2 px-4 border-b'>Pseudo</th>
            <th className='py-2 px-4 border-b'>Age</th>
            <th className='py-2 px-4 border-b'>Genre</th>
            <th className='py-2 px-4 border-b'>PostalCode</th>
            <th className='py-2 px-4 border-b'>Place</th>
            <th className='py-2 px-4 border-b'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users &&
            users.map((user, index) => (
              <tr key={index} className='text-center'>
                <td className='py-2 px-4 border-b'>{index + 1}</td>
                <td className='py-2 px-4 border-b'>{user.pseudo}</td>
                <td className='py-2 px-4 border-b'>{user.age}</td>
                <td className='py-2 px-4 border-b'>{user.genre}</td>
                <td className='py-2 px-4 border-b'>{user.postalcode}</td>
                <td className='py-2 px-4 border-b'>{user.place}</td>
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
    </div>
  );
};

export default UsersTable;
