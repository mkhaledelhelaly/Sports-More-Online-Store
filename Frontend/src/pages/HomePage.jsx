import React, { useEffect, useState } from "react";
import axios from "axios";
import "./HomePage.css";
import { Link } from "react-router-dom";

const HomePage = () => {
	const [products, setProducts] = useState([]);
	const [latestProduct, setLatestProduct] = useState(null);
	const [latestCollection, setLatestCollection] = useState([]);
	const [discountedProducts, setDiscountedProducts] = useState([]);

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				const res = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/api/products/getAllProducts`
				);
				const sortedProducts = res.data.sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
				setProducts(sortedProducts);
				setLatestProduct(sortedProducts[0]); // Last added product
				setLatestCollection(sortedProducts.slice(1, 7)); // Last 6 products excluding the latest
				setDiscountedProducts(
					sortedProducts.filter((product) => product.discount > 0)
				); // Products with discounts
			} catch (err) {
				console.error("Error fetching products:", err.message);
			}
		};

		fetchProducts();
	}, []);

	return (
		<div className="home-page">
			{/* Section 1: Best Sellers and Latest Product */}
			<div className="section best-sellers">
				<div className="best-sellers-container">
					{/* Left Half: Text */}
					<div className="best-sellers-text">
						<p>---Our Best Sellers</p>
						<h2>Latest Arrivals</h2>
						<p>Shop Now---</p>
					</div>

					{/* Right Half: Photo */}
					{latestProduct && (
						<div className="best-sellers-photo">
							<img src={latestProduct.images[0]} alt={latestProduct.title} />
						</div>
					)}
				</div>
			</div>

			<br></br>
			<br></br>
			<br></br>
			{/* Section 2: Latest Collection */}
			<div className="section latest-collection">
				<h2>Latest Collection</h2>
				<div className="product-grid">
					{latestCollection.map((product) => (
						<div key={product._id} className="product-item">
							<Link to={`/product/${product._id}`} className="product-link">
								<img src={product.images[0]} alt={product.title} />
								<h3>{product.title}</h3>
                <p>${product.price}</p>
							</Link>
						</div>
					))}
				</div>
			</div>

			<br></br>
			<br></br>
			{/* Section 3: Discounted Products */}
			<div className="section discounted-products">
				<h2>Discounted Products</h2>
				<div className="product-grid">
					{discountedProducts.map((product) => (
						<div key={product._id} className="product-item">
							<Link to={`/product/${product._id}`} className="product-link">
								<img src={product.images[0]} alt={product.title} />
								<h3>{product.title}</h3>

								<p>
									<span className="original-price">${product.price}</span>{" "}
									<span className="discounted-price">
										${product.discountedPrice.toFixed(2)}
									</span>
								</p>
							</Link>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default HomePage;