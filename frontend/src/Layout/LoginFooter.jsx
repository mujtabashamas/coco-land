import React from 'react';
import { Link } from 'react-router-dom';

const LoginFooter = () => {
  return (
    <footer className='flex bg-lightBrown p-4 items-center justify-center'>
      <div className='flex flex-col space-y-6 px-4 font-verdana xl:w-2/3 mx-auto'>
        <div className='space-y-3'>
          <p>
            <span className="font-bold ">Nouveau coco chat: </span>sur coco, discutez en live sur le premier site de chat gratuit de France avec des milliers de connectés. Tout est instantané et direct : Vous pourrez chatter dans les salons publics, en room privé ou bien en message privé. coco n’est pas seulement un tchat mais aussi un réseau social où vous pouvez retrouver vos amis. multiplie les rencontres et développe ton réseau de connaissances. coco est un forum de discussion sympa.
          </p>
          <p>
            <span className="font-bold">coco tchat: </span>échangez votre Webcam en haute définition ou envoyez des photos en salon ou en privé. partagez des vidéos ou de la musique. écoutez et participez avec votre micro sur les salons vocaux. Aujourd’hui le meilleur tchat de France : Parlez en à vos relations. Augmentez vos couronnes pour voter et bannir les connectés. Discuter, parler, tchatchez : invite tous tes contacts à venir sur le chat coco.
          </p>
          <p>
            <span className="font-bold">discuter sur coco: </span>rentrez un pseudo, un âge, votre genre et votre code postal pour rentrer dans le chat coco. utilisez un pseudonyme original pour vous différencier des autres connectés de coco et avoir plus de succès. pensez aussi à charger votre avatar pour plus de chance de rencontrer sur le chat et améliorer votre tchatchte.
          </p>
        </div>        
        <div className='flex justify-center items-center space-x-3 font-semibold text-sm'>
            <Link href="#" target='_blank' className='pr-2 border-r border-black'>Contact</Link>
            <Link href="#" className='pr-2 border-r border-black'>Aide chat</Link>
            <Link href="#" className='pr-2 border-r border-black'>Sites</Link>
            <Link href="#" className='pr-2 border-r border-black'>Statut serveurs</Link>
            <Link href="#" className='pr-2 border-r border-black'>Livre d'or</Link>
            <Link href="#" className='text-gray-700'>Effacer</Link>
        </div>
      </div>
    </footer>
  );
};

export default LoginFooter;