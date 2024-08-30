import React, { useState, useEffect, useRef } from 'react';
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
import socket from '../../socket/socket';

const Chat = ({selectedUser, setSelectedUser, usersSelected, setUsersSelected, messages, setMessages}) => {
    const room = [socket.id, selectedUser.id].sort().join('-')
    // const messages = useAppSelector((state) => state.chat.messages);
    const messagesEndRef = useRef(null);
    
    // useEffect(() => {
    //     if (selectedUser) {
    //         socket.emit('joinRoom', roomName);
    //         dispatch(sendRoomName(roomName))
    //     }
    // }, [selectedUser, roomName]);

    
    // useEffect(() => {
    //     socket.on('receiveMessage', (data) => {
    //         console.log('msg from sneder', data.message)
    //         alert(data.message.text)
    //     //   if (message.recipient === user.id || message.sender === user.id) {
    //     //     dispatch(sendMessage({ user: selectedUser, message }));
    //     //   }
    //     });
    
    //     return () => {
    //       socket.off('receiveMessage');
    //     };
    //   }, [selectedUser, dispatch, user.id]);
    console.log('msgs from chat', messages)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className='flex bg-gradient-to-b from-blue-300 to-white h-full'>
            {/* chatbox */}
            <div className="flex flex-col space-y-4 space-x-2 p-6 font-bold w-3/4 overflow-y-auto">
                <h4 className="text-purple-800 text-center">Chat with {selectedUser.pseudo}</h4>
                {messages[room]?.map((message, index) => (
                    <div key={index} className={`mb-2 ${message.sender === socket.id ? 'text-right' : 'text-left'}`}>
                        <div className={`p-2 rounded-lg text-white ${message.sender === socket.id ? 'bg-darkLilac text-right justify-end' : 'bg-pinkRose text-black'}`}>
                            <span className="font-bold">{message.sender === socket.id ? 'Me' : selectedUser.pseudo}: {message.text}</span>

                            {/* Render the media if it exists */}
                            {message.media && message.media.url && (
                                <div className="mt-2">
                                    {/* Safely check the type of the media */}
                                    {message.media.type && message.media.type.startsWith('image/') && (
                                        <img src={message.media.url} alt="media" className="max-w-xs rounded" />
                                    )}
                                    {message.media.type && message.media.type.startsWith('video/') && (
                                        <video src={message.media.url} controls className="max-w-xs rounded"></video>
                                    )}
                                </div>
                            )}
                            {/* End of media rendering */}
                        </div>
                    </div>
                ))}
            </div>
                

            {/* Image box */}
            <div className="hidden lg:flex justify-center w-1/4 py-10 mx-auto">
                <div className="flex space-x-2 bg-blue-200 border border-black h-[18rem] w-[18rem]">
                    {/* Right div */}
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
                    {/* Left div */}
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
    );
}

export default Chat;
