import Logo from '../assets/chat-logo.svg';
import React from 'react';

const Header = () => {
  return (
    <header className='bg-lightBrown pb-4 items-center'>
      <div className='flex items-center justify-end  items-right '>
        <img src={Logo} alt='' className='h-40 px-6' />
      </div>
    </header>
  );
};

export default Header;
