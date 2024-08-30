import React, { useState, useEffect, useRef } from 'react';
import Image from '../../assets/react.svg';
import { 
    FaExclamationTriangle, 
    FaPlus,
    FaQuestion,
    FaStar,
    FaMicrophone,
    FaGlobe,
    FaClock,
    FaTimes,
    FaCircle
} from 'react-icons/fa';
import { useAppSelector, useAppDispatch } from '../../store/store';

const Profil = () => {
    const user = useAppSelector((state) => state.user.user)
    const messages = useAppSelector((state) => state.chat.message);
    const messagesEndRef = useRef(null)
    const dispatch = useAppDispatch()

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages])

    return (
        <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
            <div className="flex flex-col space-y-4 items-center space-x-2 p-6 font-bold w-3/4">
                <h4 className="text-purple-800">{user}</h4>
                <p>CC</p>

                <div className="flex flex-col bg-transparent h-[30rem] overflow-y-auto p-4 space-y-2 w-full h-full">
                    {messages && messages.map((message, index) => (
                        <div key={index} className={`mb-2 ${message.sender === 'Me' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-2 rounded-lg text-white ${message.sender === 'Me' ? 'bg-darkLilac' : 'bg-pinkRose text-black'}`}>
                                <span className="font-bold">{message.sender}: </span>
                                <span>{message.text}</span>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="flex justify-center w-1/4 py-10 mx-auto">
                <div className="flex space-x-2 bg-blue-200 border border-black h-[18rem] w-[18rem]">
                    {/* right div */}
                    <div className='flex flex-col w-4/5'>
                        <div className='flex items-center justify-between py-2'>
                            <div className='uppercase font-semibold px-3 text-xl'>
                                Etramger
                            </div>
                            <button className="p-1 bg-purple-200 border border-white">
                                <FaTimes />
                            </button>
                        </div>
                    {/* img */}
                        <div className='mx-1 my-2'>
                            <img src={Image} alt="Image" className='border border-black w-56 h-56 ' />
                        </div>
                    </div>
                    {/* left div */}
                    <div className='flex flex-col space-y-2 p-2 justify-end items-center'>
                        <button className="p-1 bg-green-500 border border-white text-white">                            
                            <FaStar />
                        </button>
                        <button className="p-1 bg-pink-500 border border-white text-white">                                     
                            <FaMicrophone />
                        </button>
                        <button className="p-1 bg-blue-500 border border-white text-white">                           
                            <FaGlobe />
                        </button>
                        <button className="p-1 bg-purple-500 border border-white text-white">
                            <FaCircle />
                        </button>
                        <button className="p-1 bg-orange-500 border border-white text-white">
                            <FaClock />
                        </button>
                        <button className="p-1 bg-pink-500 border border-white text-white">                             
                            <FaExclamationTriangle />
                        </button>
                        <button className="p-1 bg-green-500 border border-white text-white">                            
                            <FaPlus />
                        </button>
                        <button className="p-1 bg-slate-500 border border-white text-white">                                
                            <FaQuestion />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profil;
