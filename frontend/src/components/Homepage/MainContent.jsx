import React, { useState, useEffect, useRef } from 'react';
import Accueil from '../tabs/Accueil';
import Eltato from '../tabs/Eltato';
import Resign from '../tabs/Resign';
import Reset from '../tabs/Reset';
import Profil from '../tabs/Profil';
import Info from '../tabs/Info';
import Premium from '../tabs/Premium';
import Amiz from '../tabs/Amiz';
import Chat from '../tabs/Chat';
import Modal from 'react-modal'
import { useAppDispatch, useAppSelector } from '../../store/store';
import { FaTimes } from 'react-icons/fa'

const MainContent = ({selectedUser, setSelectedUser, usersSelected, setUsersSelected, messages, setMessages}) => {
    const user = useAppSelector((state) => state.user.user)
    const [activeTab, setActiveTab] = useState('accueil')
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const dispatch = useAppDispatch()
    
    const tabRef = useRef(null)

    console.log('msg from content', messages)
    useEffect(() => {
      const handleClickOutside = (e) => {
        if(tabRef.current && !tabRef.current.contains(e.target)) {
          document.getElementById('filterTab').classList.add('hidden') 
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [tabRef])
  
    const renderTabContent = () => {
        switch (activeTab) {
          case 'accueil':
            return <Accueil activeTab={activeTab} setActiveTab={setActiveTab} selectedUser={selectedUser} setSelectedUser={setSelectedUser} usersSelected={usersSelected} setUsersSelected={setUsersSelected} />;
          case 'eltato':
            return <Eltato />;
          case 'resign':
            return <Resign />;
          case 'reset':
            return <Reset />;
          case 'profil':
            return <Profil />;
          case 'info':
            return <Info />;
          case 'premium':
            return <Premium />;
          case 'amiz':
            return <Amiz />;
          case 'chat':
            return <Chat selectedUser={selectedUser} setSelectedUser={setSelectedUser} usersSelected={usersSelected} setUsersSelected={setUsersSelected} messages={messages} setMessages={setMessages} />;
          default:
        return null;
        }
    };

    const handleFilter = () => {
      const tab = document.getElementById('filterTab');
      tab.classList.remove('hidden')
    }

    const openInfoModal = () => {
      setIsInfoModalOpen(true);
    }

    const openChat = (user) => {
      setActiveTab('chat')
      setSelectedUser(user)
      // dispatch(setSelectedUser(user))
    }

    const closeChat = (user) => {
      setSelectedUser('');
      // dispatch(setSelectedUser(''))
      setActiveTab('accueil');
      setUsersSelected((prevItems) => prevItems.filter(item => item.id !== user.id))
      // dispatch(removeUser(user));
    }

    return (
        <section className='flex justify-center bg-mediumBrown h-[70vh]'>
          {/* left container */}
          <div className='hidden md:block min-w-44'>
          
          </div>

          {/* center container */}
          <div className="relative flex flex-col w-full 
           bg-slate-200 border border-black ml-2">
            {/* title box */}
            <div className="flex absolute top-0 -mt-8 ml-4 rounded-t-md overflow-y-hidden">
              <button 
                className={`px-4 py-1 rounded-t-lg border border-black border-b-slate-100 ${activeTab === 'accueil' ? 'bg-slate-200' : 'bg-slate-100'}`} 
                onClick={()=>setActiveTab('accueil')}
              >
                Accueil
              </button>
              {usersSelected && 
                  usersSelected.map((user, index) => (    
                      <div key={index}
                        className={`users-center px-4 space-x-2 py-1 rounded-t-lg border border-black border-b-slate-100 ${selectedUser.id === user.id ? 'bg-blue-300' : 'bg-blue-200'}`} 
                      >
                        <button onClick={()=>openChat(user)}>{user.pseudo}</button>
                        <button className='text-xs' onClick={() => closeChat(user)}>
                          <FaTimes />
                        </button>
                      </div>                                          
                ))
              }
            </div>

            <div className='h-full overflow-y-hidden'>
              {renderTabContent()} 
            </div> 
        </div>

        {/* right container */}
        <div className="flex flex-col space-y-10 min-w-44 p-8">
            <button 
              className="font-bold bg-gray-200 border border-black py-1 hover:bg-gray-300" 
              onClick={()=>setActiveTab('accueil')}
            >
                Accuell
            </button>
            <button 
              className="relative font-bold border border-black py-1 bg-purple-300 hover:bg-purple-400" 
              onClick={handleFilter}
            >
                Filtre
            </button>
            <div ref={tabRef} id="filterTab" className="absolute top-0 -ml-4 -mr-4 py-8 left-0 bg-purple-300 px-4 rounded shadow-lg hidden">
                <button className="bg-slate-100 text-gray-800 px-4 rounded mb-2 w-full hover:text-red-500">
                  Bloquer nvx pv
                </button>
                <button className="bg-slate-100 text-gray-800 px-4 rounded mb-2 w-full hover:text-red-500">
                  Desactiator Boucier
                </button>
                <button className="bg-slate-100 text-gray-800 py-3 rounded mb-2 w-full hover:text-red-500">
                  no mecs
                </button>
                <button className="bg-slate-100 text-gray-800 px-4 rounded mb-2 w-full hover:text-red-500">
                  Age Max 99
                </button>
                <button className="bg-slate-100 text-gray-800 px-4 rounded w-full hover:text-red-500">
                  pv dv salon only
                </button>
              </div>
            <button 
              className="font-bold bg-yellow-200 border border-black py-1 hover:bg-yellow-300" 
              onClick={()=>setActiveTab('resign')}
            >
                Resign
            </button>
            <button 
              className="font-bold bg-green-200 border border-black py-1 hover:bg-green-300" 
              onClick={()=>setActiveTab('reset')}
            >
                Reset
            </button>
            <button 
              className="font-bold bg-slate-200 border border-black py-1 hover:bg-slate-300" 
              onClick={()=>setActiveTab('profil')}
            >
                Profil
            </button>
            <button 
              className="font-bold bg-pink-300 hover:bg-pink-400 border border-black py-1" 
              onClick={openInfoModal}
            >
                Info
            </button>
            <button 
              className="font-bold bg-yellow-100 hover:bg-yellow-200 border border-black py-1" 
              onClick={()=>setActiveTab('premium')}
            >
                Premium
            </button>
            <button 
              className="font-bold bg-yellow-400 hover:bg-yellow-500 border border-black py-1" 
              onClick={()=>setActiveTab('amiz')}
            >
                Amiz
            </button>
        </div>

        <Modal
          isOpen={isInfoModalOpen}
          onRequestClose={() => setIsInfoModalOpen(false)}
          style={{
            content: {
              top: '50%',
              left: '30%',
              bottom: 'auto',
              transform: 'translate(-50%, -50%)',
              width: '400px',
              padding: '0px',
              border: '2px solid black', // Adjust width for a smaller modal
            },
          }}
        >
          <div className="bg-tabColor p-3">
            <h4 className='font-bold text-lg'>vous n etes pas membre <span className="bg-yellow-100 text-green-500">Premium</span> sur ce complte ou alors celui a expire</h4>
          </div>
        </Modal>
      </section>
    )
}

export default MainContent