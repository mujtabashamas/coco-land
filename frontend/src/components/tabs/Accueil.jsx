import React, { useState, useEffect, act } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/store';
import socket from '../../socket/socket';
import Modal from 'react-modal'
import { useFormik } from 'formik';
import * as Yup from 'yup';


const Accueil = ({activeTab, setActiveTab, selectedUser, setSelectedUser, usersSelected, setUsersSelected}) => {
    const dispatch = useAppDispatch()
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedAge, setSelectedAge] = useState('');
    const [users, setUsers] = useState([]);
    const [isGenreModalOpen, setIsGenreModalOpen] = useState(false)
    const [isAgeModalOpen, setIsAgeModalOpen] = useState(false)
    const user = useAppSelector((state) => state.user.user)
    // const users = useAppSelector((state) => state.user.users)

    useEffect(() => {
        socket.emit('requestUsers')
        socket.on('updateUserList', (users) => {
            setUsers(users)
        })
        return () => {
            socket.off('updateUserList')
        }
        
    }, [])
    console.log('users after effect:', users)

    const filteredData = users?.filter((item) => {
        const userPrefix = user.postalcode.substring(0,2);
        // Extract the first 2 digits from each user's postal code
        const postalCodePrefix = item.postalcode.substring(0, 2);
    
        return (
            (!selectedGenre || item.genre === selectedGenre) &&
            (!selectedAge || item.age === parseInt(selectedAge)) &&
            postalCodePrefix === userPrefix
        );
    });
    
    const selectUser = (user) => {
        setActiveTab('chat')
        setSelectedUser(user);
        console.log('selcted user: ', selectedUser)
        const userExist = usersSelected.some((item) => item.id === user.id );
        if (!userExist) {
            setUsersSelected((prevItems) => [...prevItems, user]);
        }
        // dispatch(addUser(user));
        // dispatch(setSelectedUser(user));
    }

    const handleGenreSubmit = () => {
        if (selectedGenre) {
            setIsGenreModalOpen(false)
        } else {
            alert('Please select a genre.');
        }
    };

    const handleAgeSubmit = () => {
        if (selectedAge && selectedAge >= 18) {
            setIsAgeModalOpen(false)
        } else {
            alert('Please enter age above 18')
        }
    }

    return (
        <div className='h-full'>
            <div className='flex flex-col lg:flex-row-reverse lg:justify-between space-y-20 lg:space-y-0 overflow-y-auto items-center px-8 lg:px-0'> 
                {/* right box */}
                <div className='mt-2 flex flex-col space-y-2 w-full lg:w-1/4 '> 
                    <div  className='flex justify-between items-center px-4 py-2'>
                        <button  className='font-bold text-xl' onClick={() => setIsGenreModalOpen(true)}>
                            Genre: {selectedGenre || 'All'}
                        </button>
                        <button className='font-bold text-xl' onClick={() => setIsAgeModalOpen(true)}>
                            Age: {selectedAge || 'ALL'}
                        </button>
                        <button className='font-bold text-xl'>
                            {user.pseudo}
                        </button>
                    </div>

                    <div  className='flex flex-col bg-darkLilac overflow-y-auto border border-black custom-scrollbar'>
                        {console.log('users', users)}
                        {console.log('filtereddata', filteredData)}
                        {filteredData?.map((user, index) => (
                            <div 
                                key={index} 
                                className={`flex justify-between border border-black px-4 hover:bg-lightLilac ${user.genre === 'Femme' && 'bg-pinkRose'}`}
                                onClick={() => selectUser(user)}
                            >
                                <span className="font-bold w-2/6">{user.pseudo}</span>
                                <span className="font-bold w-1/6">{user.age}</span>
                                <span className="font-bold w-3/6">{user.postalcode}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* left box */}
                <div className='bg-lilac border border-black mx-auto lg:mx-10 custom-scrollbar lg:overflow-y-auto w-full lg:w-1/4'>
                    <div className='px-8 pb-4 w-full'> 
                        {users?.map((item, index) => (
                            <div key={index}  className={`flex justify-between font-semibold ${index % 2 !== 0 && 'bg-lightLilac text-red-500'}`}>
                                <h1>{item.pseudo}</h1>
                                <p>{item.age}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isGenreModalOpen}
                onRequestClose={() => setIsGenreModalOpen(false)}
                style={{
                    content: {
                    top: '50%',
                    left: '50%',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    padding: '0px',
                    border: '2px solid black', // Adjust width for a smaller modal
                    },
                }}
                >
                <div className="bg-lightBrown p-3">
                    <h4 className="text-2xl text-center font-semibold text-white">Select Genre</h4>
                    <div className="mt-6 flex justify-between mx-6 space-x-8">
                        <label className="flex items-center text-lg font-bold text-2xl">
                        <input
                            type="radio"
                            name="genre"
                            value="Homme"
                            className="mr-2 w-5 h-5"
                            checked={selectedGenre === 'Homme'}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        />
                        Homme
                        </label>
                        <label className="flex items-center text-lg font-bold text-2xl">
                        <input
                            type="radio"
                            name="genre"
                            value="Femme"
                            className="mr-2 w-5 h-5"
                            checked={selectedGenre === 'Femme'}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                        />
                        Femme
                        </label>
                    </div>
                    <div className="flex space-x-6 mt-8 justify-end">
                        <button className='bg-white text-brown px-3 py-2 rounded-lg font-semibold shadow-lg shadow-brown'onClick={handleGenreSubmit}>Submit</button>
                        <button className='bg-white text-brown px-3 py-2 rounded-lg font-semibold shadow-lg shadow-brown'onClick={() => setIsGenreModalOpen(false)}>Close</button>
                    </div>
                </div>
            </Modal>
            <Modal
                isOpen={isAgeModalOpen}
                onRequestClose={() => setIsAgeModalOpen(false)}
                style={{
                    content: {
                    top: '50%',
                    left: '50%',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    width: '400px',
                    padding: '0px',
                    border: '2px solid black', // Adjust width for a smaller modal
                    },
                }}
                >
                <div className="bg-lightBrown p-3">
                    <h4 className="text-2xl text-center font-semibold text-white">Select Age</h4>
                    <div className="mt-6 flex items-center justify-center">
                        <input
                        type="number"
                        name="age"
                        className={`font-semibold text-lg appearance-none w-12 p-1 border`}
                        onChange={(e) => setSelectedAge(e.target.value)}
                        />
                    </div>
                    <div className="flex space-x-6 mt-8 justify-end">
                        <button className='bg-white text-brown px-3 py-2 rounded-lg font-semibold shadow-lg shadow-brown'onClick={handleAgeSubmit}>Submit</button>
                        <button className='bg-white text-brown px-3 py-2 rounded-lg font-semibold shadow-lg shadow-brown'onClick={() => setIsGenreModalOpen(false)}>Close</button>
                    </div>
                </div>
            </Modal>
        </div>
        
    )
}

export default Accueil
