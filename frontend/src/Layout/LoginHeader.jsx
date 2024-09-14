import React from 'react';
import Logo from '../assets/coco.svg';

const LoginHeader = () => {
  return (
    <header className='bg-lightBrown max-h-[25vh] font-verdana pt-4 lg:pb-40 xl:pb-10'>
      <div className='flex flex-col items-center space-y-4 lg:pt-6 lg:px-20 xl:flex-row lg:space-y-0 lg:space-x-6 xl:items-center xl:justify-center'>
        <div className=''>
          <img src={Logo} alt='' className='w-[600px]' />
        </div>
        <div className='h-full'>
          <h4 className='text-grayishBrown text-center text-4xl font-semibold  2xl:bg-black xl:text-5xl'>
            le chat sans inscription
          </h4>
        </div>
      </div>
      {/* <div className='flex flex-col space-x-16 items-center lg:flex-row justify-center py-6'>
        <img src={Logo} alt='' className='h-32 md:w-[500px]' />
        <h4 className='text-2xl lg:text-5xl text-center text-brown font-bold '>
          le chat sans inscription
        </h4>
      </div> */}
    </header>
  );
};

export default LoginHeader;
