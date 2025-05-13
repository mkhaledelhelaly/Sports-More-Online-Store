import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./profile.css";

const Profile = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        image: null,
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        phoneNumber: "",
    });

    const [previewImage, setPreviewImage] = useState("");

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, {
                    headers: {
                        token: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const addressParts = res.data.address
                    ? res.data.address.split(",").map(part => part.trim())
                    : [];

                setFormData({
                    username: res.data.username || "",
                    email: res.data.email || "",
                    password: "",
                    image: null,
                    street: addressParts[0] || "",
                    city: addressParts[1] || "",
                    state: addressParts[2] || "",
                    zipCode: addressParts[3] || "",
                    country: addressParts[4] || "",
                    phoneNumber: res.data.phoneNumber || "",
                });

                setPreviewImage(res.data.profilePicture || "default-image-url.jpg");
            } catch (err) {
                toast.error("Failed to load user data.");
            }
        };

        fetchUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            const file = files[0];
            setFormData({ ...formData, image: file });
            setPreviewImage(URL.createObjectURL(file));
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const {
                username,
                email,
                password,
                image,
                street,
                city,
                state,
                zipCode,
                country,
                phoneNumber,
            } = formData;

            const fullAddress = `${street}, ${city}, ${state}, ${zipCode}, ${country}`;

            const formDataToSend = new FormData();
            formDataToSend.append("username", username);
            formDataToSend.append("email", email);
            if (password) formDataToSend.append("password", password);
            if (image) formDataToSend.append("image", image);
            formDataToSend.append("address", fullAddress);
            formDataToSend.append("phoneNumber", phoneNumber);

            await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/users/profile`, formDataToSend, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    token: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error("Failed to update profile.");
        }
    };

    return (
        <div className="container">
        <div className="profile-container">
            <div className="profile-card">
                <h2 className="profile-heading">Edit Profile</h2>
                <form onSubmit={handleSubmit} className="profile-form">
                    <div>
                        <label htmlFor="username" className="profile-label">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="profile-input"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="profile-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="profile-input"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="profile-label">Password (Optional)</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="Leave blank to keep current password"
                        />
                    </div>

                    {/* Split Address Inputs */}
                    <div>
                        <label className="profile-label">Street</label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="Street"
                        />
                    </div>
                    <div>
                        <label className="profile-label">City</label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="City"
                        />
                    </div>
                    <div>
                        <label className="profile-label">State</label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="State"
                        />
                    </div>
                    <div>
                        <label className="profile-label">Zip Code</label>
                        <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="Zip Code"
                        />
                    </div>
                    <div>
                        <label className="profile-label">Country</label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="Country"
                        />
                    </div>

                    <div>
                        <label htmlFor="phoneNumber" className="profile-label">Phone Number</label>
                        <input
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            className="profile-input"
                            placeholder="Enter your phone number"
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="profile-label">Profile Image</label>
                        <input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="profile-input"
                        />
                        {previewImage && (
                            <img
                                src={previewImage}
                                alt="Profile Preview"
                                className="profile-image-preview"
                            />
                        )}
                    </div>

                    <button type="submit" className="profile-button">Save Changes</button>
                </form>
            </div>
            <ToastContainer />
        </div>
        </div>
    );
};

export default Profile;
