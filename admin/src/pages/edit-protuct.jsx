import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const EditProduct = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    title: "",
    description: "",
    price: "",
    quantity: "",
    images: [],
    category: "",
  });
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);
  const fileInputs = useRef([]); // Refs for file inputs

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
        );
        setProduct(response.data);
      } catch (err) {
        console.error("Error fetching product:", err.message);
        setError("Failed to fetch product details.");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/category/getAllCategories`
        );
        setCategories(response.data);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
        setError("Failed to fetch categories.");
      }
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleImageUpload = (index) => {
    const fileInput = fileInputs.current[index];
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const updatedImages = [...product.images];
      updatedImages[index] = preview;
      setProduct({ ...product, images: updatedImages });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token"); // Get the token for authentication
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/editProduct/${id}`,
        product,
        {
          headers: { token: `Bearer ${token}` },
        }
      );
      navigate("/list-products"); // Redirect to the product list page
    } catch (err) {
      console.error("Error updating product:", err.message);
      setError("Failed to update product. Please try again.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={product.title}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Description</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={product.price}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={product.discount || 0}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            min="0"
            max="100"
            required
          />
        </div>
        <div>
  <label className="block font-bold mb-1">Old Price</label>
  <p className="text-gray-700">
    ${Number(product.price || 0).toFixed(2)}
  </p>
</div>
<div>
  <label className="block font-bold mb-1">New Price (After Discount)</label>
  <p className="text-green-500 font-bold">
    $
    {product.discount > 0
      ? (Number(product.price || 0) - (Number(product.price || 0) * product.discount) / 100).toFixed(2)
      : Number(product.price || 0).toFixed(2)}
  </p>
</div>
        <div>
          <label className="block font-bold mb-1">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={product.quantity}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Category</label>
          <select
            name="category"
            value={product.category}
            onChange={handleChange}
            className="w-full border border-gray-300 px-3 py-2 rounded"
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">Upload Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  key={index}
                  className="relative w-24 h-24 sm:w-32 sm:h-32 border border-gray-300 rounded flex items-center justify-center cursor-pointer bg-gray-100"
                  onClick={() => handleImageUpload(index)}
                >
                  {product.images[index] ? (
                    <img
                      src={product.images[index]}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <span className="text-gray-500 text-xl sm:text-2xl">+</span>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={(el) => (fileInputs.current[index] = el)}
                    onChange={(e) => handleFileChange(e, index)}
                    className="hidden"
                  />
                  {product.images[index] && (
                    <button
                      type="button"
                      onClick={() =>
                        setProduct({
                          ...product,
                          images: product.images.filter((_, i) => i !== index),
                        })
                      }
                      className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}
          </div>
          <small className="text-gray-500">
            Upload up to 4 images or remove existing ones.
          </small>
        </div>
        <button
          type="submit"
          className="bg-[#428b0f] text-white px-4 py-2 rounded hover:bg-[#36720c]"
        >
          Update Product
        </button>
      </form>
    </div>
  );
};

export default EditProduct;
