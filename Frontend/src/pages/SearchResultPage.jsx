import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import "./SearchResultPage.css"; // Import the CSS file

const SearchResultsPage = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products/search/query?q=${query}`);
        setResults(res.data);
      } catch (err) {
        console.error("Error fetching search results:", err.message);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="search-results-page">
      <h1>Search Results for "{query}"</h1>
      <div className="results-grid">
        {results.length > 0 ? (
          results.map((product) => (
            <Link
              to={`/product/${product._id}`} // Navigate to ProductDetailPage with product ID
              key={product._id}
              className="product-link"
            >
              <div className="product-item">
                <img src={product.images[0]} alt={product.title} />
                <h3>{product.title}</h3>
                <p>${product.price}</p>
              </div>
            </Link>
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;