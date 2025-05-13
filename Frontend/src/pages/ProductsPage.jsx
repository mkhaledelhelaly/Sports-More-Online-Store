import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState(""); // State for selected sort option
    
  useEffect(() => {
    const fetchProductsAndCategories = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/getAllProducts`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/category/getAllCategories`),
        ]);
        console.log(productsRes.data);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
      } catch (err) {
        console.error(err.message);
        setError("Failed to fetch products or categories.");
        setLoading(false);
      }
    };

    fetchProductsAndCategories();
  }, []);

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevSelected) =>
      prevSelected.includes(categoryId)
        ? prevSelected.filter((id) => id !== categoryId)
        : [...prevSelected, categoryId]
    );
  };

  const handleSortChange = (value) => {
    setSortOption(value); // Update the selected sort option
    let sortedProducts = [...products];

    switch (value) {
      case "price-asc":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "alphabet-asc":
        sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "alphabet-desc":
        sortedProducts.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "date-asc":
        sortedProducts.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "date-desc":
        sortedProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      default:
        break;
    }

    setProducts(sortedProducts); // Update the products state with the sorted list
  };

  const filteredProducts = selectedCategories.length
    ? products.filter((product) =>
        selectedCategories.includes(product.category)
      )
    : products;

  return (
    <div className="products-page">
    <aside className="filter-sidebar">
      <h3 className="filter-title">Filter</h3>
      <div className="filter-box">
      <h3 className="filter-title">Categories</h3>
        <ul className="filter-categories">
          {categories.map((category) => (
            <li key={category._id}>
              <input
                type="checkbox"
                id={category._id}
                value={category._id}
                className="filter-checkbox"
                onChange={() => handleCategoryChange(category._id)}
              />
              <label htmlFor={category._id}>{category.name}</label>
            </li>
          ))}
        </ul>
      </div>
    </aside>

      <main className="products-main">
        <div className="products-header">
          <h1 className="products-title">All Products</h1>
          <div className="sort-container">
          <label htmlFor="sort-dropdown" className="sort-label">Sort By:</label>
          <select
            id="sort-dropdown"
            className="sort-dropdown"
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="">All Products</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="alphabet-asc">Alphabet: A to Z</option>
            <option value="alphabet-desc">Alphabet: Z to A</option>
            <option value="date-asc">Date: Oldest First</option>
            <option value="date-desc">Date: Newest First</option>
          </select>
        </div>
        </div>
        <div className="products-list">
          {loading ? (
            <p>Loading products...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link
                to={`/product/${product._id}`}
                key={product._id}
                className="product-item"
              >
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="product-image"
                />
                <h3>{product.title}</h3>
                <p className="price">
                  {product.discount > 0 ? (
                    <>
                      <span className="line-through text-red-500 mr-2">
                        ${Number(product.price || 0).toFixed(2)}
                      </span>
                      <span className="text-green-500 font-bold">
                        $
                        {(
                          Number(product.price || 0) -
                          (Number(product.price || 0) * product.discount) / 100
                        ).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span>${Number(product.price || 0).toFixed(2)}</span>
                  )}
                </p>
              </Link>
            ))
          ) : (
            <p>No products found for the selected categories.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductsPage;