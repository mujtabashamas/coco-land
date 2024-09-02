import React from 'react';
import Logo from '../assets/chat-logo.svg';

const Header = () => {
  return (
    <header className='bg-lightBrown h-48 py-2 items-center'>
      <div className='flex items-center justify-end  items-right '>
        <img src={Logo} alt='' className='h-40 px-6' />
      </div>
    </header>
  );
};

export default Header;
