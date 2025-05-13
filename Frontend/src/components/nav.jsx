import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./nav.css";
import {
    FaSearch,
    FaUser,
    FaShoppingCart,
    FaBox,
    FaSignOutAlt,
    FaUserCircle,
    FaBars, // Import the hamburger icon
    FaTimes, // Import the close icon
} from "react-icons/fa";
import { useRef } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext";

const Nav = ({ isLoggedIn, onLogout }) => {
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [profilePicture, setProfilePicture] = useState("");
    const [menuOpen, setMenuOpen] = useState(false); // State for hamburger menu
    const { cartCount, fetchCartCount, setCartCount } = useContext(CartContext);
    const searchBarRef = useRef(null);

    useEffect(() => {
        setIsUserLoggedIn(isLoggedIn);
        if (isUserLoggedIn) {
            fetchCartCount();
        }
    }, [isLoggedIn, fetchCartCount, isUserLoggedIn]);

    const handleSearchIconClick = () => {
        setShowSearchBar(true);
    };

    const handleSearch = (e) => {
        if (e.key === "Enter") {
            navigate(`/search?query=${searchQuery}`);
            setShowSearchBar(false);
        }
    };

    const handleClickOutside = (e) => {
        if (searchBarRef.current && !searchBarRef.current.contains(e.target)) {
            setShowSearchBar(false);
        }
    };

    useEffect(() => {
        if (showSearchBar) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showSearchBar]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setCartCount(0);
        navigate(`/`);
        onLogout();
        setShowDropdown(false);
    };

    const handleLogin = () => {
        navigate("/login");
        setShowDropdown(false);
    };

    const handleProfileClick = () => {
        setShowDropdown(!showDropdown);
    };

    const handleNavigate = (path) => {
        navigate(path);
        setShowDropdown(false);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen); // Toggle the menu state
    };

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                    headers: {
                        token: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setProfilePicture(res.data.profilePicture || "default-image-url.jpg");
            } catch (err) {
                console.error("Failed to fetch profile picture:", err);
            }
        };

        if (isUserLoggedIn) {
            fetchProfilePicture();
        }
    }, [isUserLoggedIn]);

    return (
        <nav className="nav">
            {/* Logo */}
            <div className="nav-logo">
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSq5Kkn3gKB4zi_VhPmD11macRlNJAXxjNTbA&s"
                    alt="Logo"
                    className="logo"
                />
            </div>

            {/* Hamburger Menu */}
            <div className="menu-toggle" onClick={toggleMenu}>
                {menuOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* Nav Links */}
            <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
                <li>
                    <NavLink
                        to="/"
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)} // Close menu on click
                    >
                        Home
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/collection"
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)} // Close menu on click
                    >
                        Collection
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/about"
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)} // Close menu on click
                    >
                        About
                    </NavLink>
                </li>
                <li>
                    <NavLink
                        to="/contact"
                        className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                        onClick={() => setMenuOpen(false)} // Close menu on click
                    >
                        Contact
                    </NavLink>
                </li>
            </ul>

            {/* Icons */}
            <div className="nav-icons">
                {showSearchBar ? (
                    <input
                        type="text"
                        className="search-bar"
                        placeholder="Search for products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                ) : (
                    <i
                        className="fas fa-search search-icon"
                        onClick={handleSearchIconClick}
                    ></i>
                )}
                <div className="profile-icon-container">
                    <FaUser className="icon" onClick={handleProfileClick} />
                    {showDropdown && (
                        <div className="dropdown-menu">
                            {isUserLoggedIn ? (
                                <>
                                    <div className="dropdown-profile-picture">
                                        <img
                                            src={profilePicture}
                                            alt="Profile"
                                            className="profile-picture"
                                        />
                                    </div>
                                    <div
                                        className="dropdown-item"
                                        onClick={() => handleNavigate("/orders")}
                                    >
                                        <FaBox className="dropdown-icon" /> View Orders
                                    </div>
                                    <div
                                        className="dropdown-item"
                                        onClick={() => handleNavigate("/profile")}
                                    >
                                        <FaUserCircle className="dropdown-icon" /> Profile
                                    </div>
                                    <div className="dropdown-item" onClick={handleLogout}>
                                        <FaSignOutAlt className="dropdown-icon" /> Logout
                                    </div>
                                </>
                            ) : (
                                <div className="dropdown-item" onClick={handleLogin}>
                                    <FaUserCircle className="dropdown-icon" /> Login
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="cart-icon-container">
                    <FaShoppingCart
                        className="icon"
                        onClick={() => navigate("/cart")}
                    />
                    {cartCount > 0 && (
                        <span className="cart-count-badge">{cartCount}</span>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Nav;
