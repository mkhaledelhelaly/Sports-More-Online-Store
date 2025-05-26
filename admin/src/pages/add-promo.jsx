import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddPromo = () => {
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [promoCodes, setPromoCodes] = useState([]);

  const fetchPromoCodes = async () => {
    try {
      const token = localStorage.getItem('token'); // Get the token for authentication
      if (!token) {
        toast.error('You are not authorized to perform this action.');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/promo`, {
        headers: {
          token: `Bearer ${token}`,
        },
      });

      setPromoCodes(response.data);
    } catch (err) {
      toast.error('Failed to fetch promo codes.');
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('You are not authorized to perform this action.');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/promo/create`,
        {
          code,
          discountPercent,
          expiryDate,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            token: `Bearer ${token}`,
          },
        }
      );

      toast.success('Promo code added successfully!');
      setCode('');
      setDiscountPercent('');
      setExpiryDate('');
      fetchPromoCodes(); // Refresh the promo codes list
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Something went wrong';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <ToastContainer />
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">Add Promo Code</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Promo Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter promo code"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Discount Percentage</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter discount percentage"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Expiry Date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#428b0f] text-white py-2 px-4 rounded hover:bg-[#36720c]"
        >
          Add Promo Code
        </button>
      </form>

      <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-center sm:text-left">All Promo Codes</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Code</th>
              <th className="border border-gray-300 p-2">Discount (%)</th>
              <th className="border border-gray-300 p-2">Expiry Date</th>
              <th className="border border-gray-300 p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.map((promo) => (
              <tr key={promo._id}>
                <td className="border border-gray-300 p-2">{promo.code}</td>
                <td className="border border-gray-300 p-2">{promo.discountPercent}</td>
                <td className="border border-gray-300 p-2">
                  {new Date(promo.expiryDate).toLocaleDateString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {promo.isActive ? 'Active' : 'Inactive'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddPromo;