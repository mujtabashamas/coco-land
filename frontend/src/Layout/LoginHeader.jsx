import React from 'react';
import Logo from '../assets/chat-logo.svg';

const LoginHeader = () => {
  return (
    <header className='bg-lightBrown h-48 font-verdana'>
      <div className='flex flex-col xl:flex-row items-center lg:flex-row justify-center py-6'>
        <img src={Logo} alt="" className='h-40'/>
        <h4 className='text-6xl text-brown mt-12 font-bold '>
          le chat sans inscription
        </h4>
      </div>
    </header>
  );
};

export default LoginHeader;
