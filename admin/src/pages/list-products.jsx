import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ListProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch products and categories
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/getAllProducts`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category/getAllCategories`),
        ]);
        setProducts(productsResponse.data);
        setCategories(categoriesResponse.data);
      } catch (err) {
        console.error('Error fetching data:', err.message);
        setError('Failed to fetch data. Please try again later.');
      }
    };
    fetchProductsAndCategories();
  }, []);

  // Delete a product
  const handleDelete = async (productId) => {
    try {
      const token = localStorage.getItem('token'); // Get the token for authentication
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/products/deleteProduct/${productId}`, {
        headers: { token: `Bearer ${token}` },
      });
      setProducts(products.filter((product) => product._id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err.message);
      setError('Failed to delete product. Please try again later.');
    }
  };

  // Edit a product
  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>
      {error && <p className="text-red-500">{error}</p>}

      {/* Low Stock Alert */}
      {products.some((product) => product.quantity < 10) && (
        <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 text-xl">
          <p>
            <strong>Warning:</strong> Some products have low stock (less than 10 units). Please restock them!
          </p>
        </div>
      )}

      {/* Sort by Category Dropdown */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Sort by Category</label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-full sm:w-64"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Image</th>
              <th className="border border-gray-300 px-4 py-2">Title</th>
              <th className="border border-gray-300 px-4 py-2">Quantity</th>
              <th className="border border-gray-300 px-4 py-2">Price</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product._id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/100'}
                    alt={product.title}
                    className="w-25 h-25 object-cover mx-auto"
                  />
                </td>
                <td className="border border-gray-300 px-4 py-2 text-xl">{product.title}</td>
                <td
                  className={`border border-gray-300 px-4 py-2 text-xl ${
                    product.quantity < 10 ? 'text-red-500 font-bold text-xl' : ''
                  }`}
                >
                  {product.quantity}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-xl">
                  {product.discount > 0 ? (
                    <>
                      <span className="line-through text-red-500 mr-2">${product.price.toFixed(2)}</span>
                      <span className="text-green-500 font-bold">
                        ${(product.price - (product.price * product.discount) / 100).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span>${product.price.toFixed(2)}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEdit(product._id)}
                    className="bg-[#428b0f] text-white px-2 py-1 rounded mr-2 text-xl"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xl"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListProducts;