import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/store';
import { updateUser } from '../../features/userSlice';
import socket from '../../socket/socket';
import {
  FaExclamationTriangle,
  FaPlus,
  FaQuestion,
  FaStar,
  FaMicrophone,
  FaGlobe,
  FaClock,
  FaTimes,
  FaCircle,
} from 'react-icons/fa';

const Profil = () => {
  const user = useAppSelector((state) => state.user.user);
  const [image, setImage] = useState(user?.image ? user.image : null);
  const dispatch = useAppDispatch();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      dispatch(updateUser({ ...user, image: imageUrl }));
      console.log('userif', user.userID);
      socket.emit('updateUserImage', imageUrl, user.userID);
    }
  };

  return (
    <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
      <div className='flex flex-col space-y-4 p-6 py-20 w-3/4'>
        <div className='flex space-x-1'>
          <h4 className='text-purple-800 font-bold'>Pseudo: </h4>
          <span> {user.pseudo}</span>
        </div>
        <div className='flex space-x-1'>
          <h4 className='text-purple-800 font-bold'>Genre: </h4>
          <span> {user.genre}</span>
        </div>
        <div className='flex space-x-1'>
          <h4 className='text-purple-800 font-bold'>Age: </h4>
          <span> {user.age}</span>
        </div>
        <div className='flex space-x-1'>
          <h4 className='text-purple-800 font-bold'>PostalCode: </h4>
          <span> {user.postalcode}</span>
        </div>
        <div className='flex space-x-1'>
          <h4 className='text-purple-800 font-bold'>Place: </h4>
          <span> {user.place}</span>
        </div>
        {user.status && (
          <div className='flex space-x-1'>
            <h4 className='text-purple-800 font-bold'>Status: </h4>
            <span>{user.status}</span>
          </div>
        )}
      </div>

      <div className='flex justify-center p-4 py-10 mx-auto'>
        <div className='flex space-x-2 bg-blue-200 border border-black h-[18rem] w-[18rem]'>
          {/* right div */}
          <div className='flex flex-col w-4/5'>
            <div className='flex items-center justify-between py-2'>
              <div className='uppercase font-semibold px-3 text-xl'>
                {user.place}
              </div>
              <button className='p-1 bg-purple-200 border border-white'>
                <FaTimes />
              </button>
            </div>
            {/* img */}
            <div className='w-56 h-56 m-1 mt-2 relative'>
              <input
                id='file-input'
                type='file'
                className='w-56 h-56 hidden'
                onChange={(e) => handleImageChange(e)}
              />
              <label
                htmlFor='file-input'
                className='w-full h-full text-gray-500 absolute top-0 left-0 flex items-center justify-center border border-gray-700 cursor-pointer font-bold text-center'
              >
                {image ? (
                  <img
                    src={image}
                    alt='Image'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  'Choose File'
                )}
              </label>
            </div>
          </div>
          {/* left div */}
          <div className='flex flex-col space-y-2 p-2 justify-end items-center'>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaStar />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaMicrophone />
            </button>
            <button className='p-1 bg-blue-500 border border-white text-white'>
              <FaGlobe />
            </button>
            <button className='p-1 bg-purple-500 border border-white text-white'>
              <FaCircle />
            </button>
            <button className='p-1 bg-orange-500 border border-white text-white'>
              <FaClock />
            </button>
            <button className='p-1 bg-pink-500 border border-white text-white'>
              <FaExclamationTriangle />
            </button>
            <button className='p-1 bg-green-500 border border-white text-white'>
              <FaPlus />
            </button>
            <button className='p-1 bg-slate-500 border border-white text-white'>
              <FaQuestion />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;
