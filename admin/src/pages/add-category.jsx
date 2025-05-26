import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddCategory = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState([]);

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category/getAllCategories`);
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err.message);
        toast.error('Error fetching categories');
      }
    };
    fetchCategories();
  }, []);

  // Handle form submission
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/category/addCategory`,
        { name: categoryName },
        {
          headers: {
            token: `Bearer ${localStorage.getItem('token')}`, // Assuming token is stored in localStorage
          },
        }
      );
      toast.success(response.data.message);
      setCategories([...categories, response.data.category]); // Update the category list
      setCategoryName(''); // Clear the input field
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding category');
    }
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Add Category</h1>
      <form onSubmit={handleAddCategory} className="mb-4">
        <input
          type="text"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          placeholder="Enter category name"
          className="border p-2 rounded w-full mb-2"
          required
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add Category
        </button>
      </form>

      <h2 className="text-xl font-bold mt-6">All Categories</h2>
      <ul className="list-disc pl-5">
        {categories.map((category) => (
          <li key={category._id} className="py-1">
            {category.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AddCategory;