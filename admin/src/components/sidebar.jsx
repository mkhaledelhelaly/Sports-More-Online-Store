import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FaPlus, FaList, FaShoppingCart, FaFolderPlus, FaBars, FaTimes, } from 'react-icons/fa';
import { TbRosetteDiscountFilled } from "react-icons/tb";


const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // State to toggle sidebar

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Toggle Button for Mobile */}
      <button
        className="fixed top-4 left-4 z-50 text-white bg-black p-2 rounded-md sm:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen min-h-full w-64 bg-black text-white flex flex-col z-40 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 sm:translate-x-0 sm:relative overflow-y-auto`}
      >
        <div className="p-4 text-2xl font-bold border-b border-gray-700">
          Admin Menu
        </div>
        <ul className="flex-grow">
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <FaPlus className="mr-2" />
            <NavLink
              to="/add-product"
              className={({ isActive }) =>
                isActive ? 'text-[#428b0f] font-bold' : 'text-white'
              }
            >
              Add Product
            </NavLink>
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <FaList className="mr-2" />
            <NavLink
              to="/list-products"
              className={({ isActive }) =>
                isActive ? 'text-[#428b0f] font-bold' : 'text-white'
              }
            >
              List Products
            </NavLink>
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <FaShoppingCart className="mr-2" />
            <NavLink
              to="/view-orders"
              className={({ isActive }) =>
                isActive ? 'text-[#428b0f] font-bold' : 'text-white'
              }
            >
              View Orders
            </NavLink>
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <FaFolderPlus className="mr-2" />
            <NavLink
              to="/add-category"
              className={({ isActive }) =>
                isActive ? 'text-[#428b0f] font-bold' : 'text-white'
              }
            >
              Add Category
            </NavLink>
          </li>
          <li className="p-4 hover:bg-gray-700 cursor-pointer flex items-center">
            <TbRosetteDiscountFilled className="mr-2 text-xl" />
            <NavLink
              to="/add-promo"
              className={({ isActive }) =>
                isActive ? 'text-[#428b0f] font-bold' : 'text-white'
              }
            >
              Add Promo
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default Sidebar;