import React, { useState, useRef, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddProduct = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [localImages, setLocalImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState(Array(4).fill(null)); // Array for 4 previews
  const [categories, setCategories] = useState([]); // To store fetched categories
  const [category, setCategory] = useState(''); // Selected category
  const [quantity, setQuantity] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); // For modal preview


  const fileInputs = useRef([]); // Refs for file inputs

  const defaultSizes = ['S', 'M', 'L', 'XL']; // Default sizes
  const defaultColors = ['WHITE', 'BLACK', 'BLUE', 'RED', 'PINK', 'YELLOW', 'PURPLE', 'GRAY']; // Default colors

  const [sizes, setSizes] = useState([]); // Selected sizes
  const [colors, setColors] = useState([]); // Selected colors

  const handleSizeChange = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter((s) => s !== size)); // Remove size if already selected
    } else {
      setSizes([...sizes, size]); // Add size if not selected
    }
  };

  const handleColorChange = (color) => {
    if (colors.includes(color)) {
      setColors(colors.filter((c) => c !== color)); // Remove color if already selected
    } else {
      setColors([...colors, color]); // Add color if not selected
    }
  };

  // Fetch categories from the backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/category/getAllCategories`);
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(data); // Set the fetched categories
      } catch (error) {
        console.error('Error fetching categories:', error.message);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleImageUpload = (index) => {
    const fileInput = fileInputs.current[index];
    if (fileInput) {
      fileInput.click(); // Trigger file input click
    }
  };

  const handleFileChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      const updatedPreviews = [...imagePreviews];
      updatedPreviews[index] = preview;
      setImagePreviews(updatedPreviews);

      // Convert the file to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedLocalImages = [...localImages];
        updatedLocalImages[index] = reader.result; // Base64 string
        setLocalImages(updatedLocalImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Get the token for authentication
    if (!token) {
      toast.error('You are not authorized to perform this action.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/createProduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          token: `Bearer ${token}`, // Pass the token in the Authorization header
        },
        body: JSON.stringify({
          title,
          description,
          price,
          images: localImages, // Send base64 strings or URLs
          category,
          quantity,
          sizes, // Include selected sizes
          colors, // Include selected colors
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success('Product added successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setLocalImages([]);
      setImagePreviews(Array(4).fill(null));
      setCategory('');
      setQuantity('');
      setSizes([]); // Reset sizes
      setColors([]); // Reset colors
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="p-4 sm:p-8">
      <ToastContainer />
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">Add Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter product title"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter product description"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter product price"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Upload Images</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {imagePreviews.map((preview, index) => (
              <div
                key={index}
                className="relative w-24 h-24 sm:w-32 sm:h-32 border border-gray-300 rounded flex items-center justify-center cursor-pointer bg-gray-100"
                onClick={() => handleImageUpload(index)}
              >
                {preview ? (
                  <img
                    src={preview}
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
              </div>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="" disabled>
              Select a category
            </option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter product quantity"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Sizes</label>
          <div className="flex flex-wrap gap-4">
            {defaultSizes.map((size) => (
              <label key={size} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={size}
                  checked={sizes.includes(size)}
                  onChange={() => handleSizeChange(size)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{size}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-gray-700 mb-2 text-xl">Colors</label>
          <div className="flex flex-wrap gap-4">
            {defaultColors.map((color) => (
              <label key={color} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={color}
                  checked={colors.includes(color)}
                  onChange={() => handleColorChange(color)}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="text-gray-700">{color}</span>
              </label>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#428b0f] text-white py-2 px-4 rounded hover:bg-[#36720c]"
        >
          Add Product
        </button>
      </form>

      {/* Modal for full image preview */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Preview"
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </div>
  );
};

export default AddProduct;