import Logo from '../assets/coco.svg';
import React from 'react';

const Header = () => {
  return (
    <header className='bg-lightBrown pb-4 items-center'>
      <div className='flex items-center justify-end px-20 items-right '>
        <img src={Logo} alt='' className='h-32 w-[600px]' />
      </div>
    </header>
  );
};

export default Header;
