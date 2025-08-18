// Sidebar.jsx
import React, { useState } from 'react';
import { FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
     const [showProfileMenu, setShowProfileMenu] = useState(false);

     return (
          <div className={`sidebar ${isOpen ? 'open' : ''}`}>
               <div className="p-6">

                    {/* Full-width close button at the top */}
                    <button
                         onClick={onClose}
                         aria-label="Close sidebar"
                         className="w-full flex items-center justify-center hover:bg-gray-800 "
                    >

                         <span className="text-4xl">JERRY</span>
                    </button>

                    <ul>
                         <li className="py-3 px-3 text-lg rounded hover:bg-gray-600 cursor-pointer">New Chat</li>
                         <li className="py-3 px-3 text-lg rounded hover:bg-gray-600 cursor-pointer">Chat History</li>
                         <li className="py-3 px-3 text-lg rounded hover:bg-gray-600 cursor-pointer">Help</li>
                    </ul>
               </div>

               {/* Profile section at bottom */}
               <div
                    className="profile p-5 text-lg flex items-center justify-between"
                    onMouseEnter={() => setShowProfileMenu(true)}
                    onMouseLeave={() => setShowProfileMenu(false)}
               >
                    <div className="flex items-center">
                         <FaUser className="mr-3 text-xl" />
                         <span className="font-medium">Guest</span>
                    </div>

                    {showProfileMenu && (
                         <div className="profile-menu flex flex-col ml-2">
                              <button className="py-2 px-3 text-base rounded hover:bg-gray-700 flex items-center">
                                   <FaCog className="mr-2" /> Settings
                              </button>
                              <button className="py-2 px-3 text-base rounded hover:bg-gray-700 flex items-center mt-2">
                                   <FaSignOutAlt className="mr-2" /> Sign Out
                              </button>
                         </div>
                    )}
               </div>
          </div>
     );
};

export default Sidebar;
