import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ProductDetailPage.css";
import { CartContext } from "../context/CartContext";

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviewComment, setReviewComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const { fetchCartCount } = useContext(CartContext);
  const navigate = useNavigate();
  
  // Refs for the slider
  const reviewsContainerRef = useRef(null);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  // State for quantity
  const [quantity, setQuantity] = useState(1);
  const handleIncrease = () => setQuantity(quantity + 1);
  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleImageClick = (image) => {
    setMainImage(image); 
  };

  useEffect(() => {
    console.log(`Extracted Product ID from URL: ${id}`);
    const fetchProduct = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`
        );
        console.log("Fetched Product Data:", response.data);
        setProduct(response.data);
        setMainImage(response.data.images[0]);
        setReviews(response.data.reviews);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error fetching product:",
          err.response?.data || err.message
        );
        setError("Failed to fetch product details. Please try again later.");
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        if (product && product.category) {
          const response = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/products/related/${product.category}/${product._id}`
          );
          setRelatedProducts(response.data);
        }
      } catch (err) {
        console.error("Error fetching related products:", err.message);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  // Functions for slider controls
  const scrollToNext = () => {
    if (currentReviewIndex < reviews.length - 1) {
      setCurrentReviewIndex(currentReviewIndex + 1);
      if (reviewsContainerRef.current) {
        const scrollAmount = reviewsContainerRef.current.offsetWidth;
        reviewsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollToPrevious = () => {
    if (currentReviewIndex > 0) {
      setCurrentReviewIndex(currentReviewIndex - 1);
      if (reviewsContainerRef.current) {
        const scrollAmount = -reviewsContainerRef.current.offsetWidth;
        reviewsContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "star filled" : "star"}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleReviewSubmit = async () => {
    if (selectedRating === 0 || reviewComment.trim() === "") {
      toast.error("Please provide a rating and a comment.");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/products/${id}/createReview`,
        {
          rating: selectedRating,
          comment: reviewComment,
        },
        {
          headers: {
            token: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Add the new review to the reviews list
      const updatedReviews = [...reviews, response.data];
      setReviews(updatedReviews);

      // Recalculate the average rating
      const updatedAverageRating =
        updatedReviews.reduce((sum, review) => sum + review.rating, 0) /
        updatedReviews.length;

      // Update the product state with the new average rating
      setProduct((prevProduct) => ({
        ...prevProduct,
        reviews: updatedReviews,
        averageRating: updatedAverageRating,
      }));

      setSelectedRating(0);
      setReviewComment("");
      toast.success("Review submitted successfully!");
    } catch (err) {
      console.error(
        "Error submitting review:",
        err.response?.data || err.message
      );
      toast.error("Failed to submit review. Please try again later.");
    }
  };

  const handleAddToCart = async () => {
    if (!selectedSize) {
        toast.error("Please select a size before adding to the cart.");
        return;
    }

    if (!selectedColor) {
        toast.error("Please select a color before adding to the cart.");
        return;
    }

    // Calculate the discounted price
    const discountedPrice = product.discount > 0
        ? product.price - (product.price * product.discount) / 100
        : product.price;

        console.log("Discounted Price:", discountedPrice);

    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
            {
                productId: product._id,
                quantity,
                size: selectedSize,
                color: selectedColor,
                price: discountedPrice, // Send the discounted price
            },
            {
                headers: {
                    token: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        toast.success("Product added to cart successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
        setSelectedColor(null);
        setSelectedSize(null);
        setQuantity(1);
    } catch (err) {
        console.error("Error adding to cart:", err.message);
        toast.error("Failed to add product to cart. Please try again.");
    }
    fetchCartCount();
};

  return (
    <div className="product-detail-page">
      <div className="product-detail-content">
        {loading ? (
          <p>Loading product details...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <>
            <div className="product-detail">
              <div className="product-images">
                <img
                  src={mainImage}
                  alt={product.title}
                  className="main-image"
                />
                <div className="thumbnail-images">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.title} ${index}`}
                      className="thumbnail-image"
                      onClick={() => handleImageClick(image)}
                    />
                  ))}
                </div>
              </div>
              <div className="product-info">
                <h1>{product.title}</h1>
                <div className="rating">
                  {renderStars(
                    Math.round(
                      product.reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / product.reviews.length
                    )
                  )}
                </div>
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
                <p className="description">{product.description}</p>

                {/* Select Size Section */}
                <div className="select-size">
                  <h3>Select Size:</h3>
                  <div className="size-options">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-button ${
                          selectedSize === size ? "selected" : ""
                        }`}
                        onClick={() => setSelectedSize(selectedSize === size ? null : size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Select Color Section */}
                <div className="select-color">
                  <h3>Select Color:</h3>
                  <div className="color-options">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        className={`color-button ${
                          selectedColor === color ? "selected" : ""
                        }`}
                        onClick={() => setSelectedColor(selectedColor === color ? null : color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <br></br>
                <div className="quantity-selector">
                  <button className="quantity-button" onClick={handleDecrease}>
                    -
                  </button>
                  <input
                    type="text"
                    className="quantity-input"
                    value={quantity}
                    readOnly
                  />
                  <button className="quantity-button" onClick={handleIncrease}>
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button className="add-to-cart-button" onClick={handleAddToCart}>
                  Add to Cart
                </button>
                <br />

                {/* Additional Information */}
                <br />
                <br />
                <hr className="my-4 border-gray-300" />
                <br />
                <div className="additional-info">
                  <p>100% Original product.</p>
                  <p>Cash on delivery is available on this product.</p>
                  <p>Easy return and exchange policy within 7 days.</p>
                </div>
              </div>
            </div>

            {/* Reviews Section with Slider */}
            <div className="reviews-tab">
              <h2 className="reviews-title">Ratings & Reviews</h2>
              <div className="average-rating">
                <span className="rating-value">
                  {product.reviews.length > 0
                    ? (
                        product.reviews.reduce(
                          (sum, review) => sum + review.rating,
                          0
                        ) / product.reviews.length
                      ).toFixed(1)
                    : "0"}
                </span>
                <span className="rating-stars">
                  {renderStars(
                    Math.round(
                      product.reviews.reduce(
                        (sum, review) => sum + review.rating,
                        0
                      ) / product.reviews.length
                    )
                  )}
                </span>
                <span className="rating-count">
                  ({product.reviews.length} reviews)
                </span>
              </div>

              {/* Reviews Slider */}
              <div className="reviews-slider-container">
                {reviews.length > 0 && (
                  <>
                    <button 
                      className="slider-control prev"
                      onClick={scrollToPrevious}
                      disabled={currentReviewIndex === 0}
                    >
                      &#10094;
                    </button>
                    
                    <div className="reviews-slider" ref={reviewsContainerRef}>
                      {reviews.map((review, index) => {
                        const reviewDate = new Date(review.createdAt);
                        const formattedDate = `${reviewDate
                          .getDate()
                          .toString()
                          .padStart(2, "0")}/${(reviewDate.getMonth() + 1)
                          .toString()
                          .padStart(2, "0")}/${reviewDate.getFullYear()}`;
                        return (
                          <div key={index} className="review-card">
                            <div className="review-header">
                              <span className="review-username">
                                {review.user.username}
                              </span>
                              <span className="review-stars">
                                {renderStars(review.rating)}
                              </span>
                            </div>
                            <p className="review-comment">{review.comment}</p>
                            <p className="review-date">{formattedDate}</p>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      className="slider-control next"
                      onClick={scrollToNext}
                      disabled={currentReviewIndex === reviews.length - 1}
                    >
                      &#10095;
                    </button>
                  </>
                )}
                
                {reviews.length === 0 && (
                  <p>No reviews available for this product.</p>
                )}
              </div>

              {/* Slider Navigation Dots */}
              {reviews.length > 1 && (
                <div className="slider-dots">
                  {reviews.map((_, index) => (
                    <span 
                      key={index} 
                      className={`dot ${index === currentReviewIndex ? 'active' : ''}`}
                      onClick={() => {
                        setCurrentReviewIndex(index);
                        if (reviewsContainerRef.current) {
                          reviewsContainerRef.current.scrollTo({ 
                            left: index * reviewsContainerRef.current.offsetWidth, 
                            behavior: 'smooth' 
                          });
                        }
                      }}
                    ></span>
                  ))}
                </div>
              )}

              {/* Add Review Section */}
              <div className="add-review-section">
                <h3>Write a Review</h3>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${
                        star <= selectedRating ? "selected" : ""
                      }`}
                      onClick={() => setSelectedRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <textarea
                  className="review-textbox"
                  placeholder="Share your thoughts about this product..."
                  rows="4"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                ></textarea>
                <br></br>
                <button
                  className="submit-review-button"
                  onClick={handleReviewSubmit}
                >
                  Submit Review
                </button>
              </div>
            </div>

            {/* Related Products Section */}
            <div className="related-products">
              <h2 className="related-products-title">Related Products</h2>
              <div className="related-products-grid">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct._id}
                    className="related-product-card"
                    onClick={() =>
                      (window.location.href = `/product/${relatedProduct._id}`)
                    }
                  >
                    <img
                      src={relatedProduct.images[0]}
                      alt={relatedProduct.title}
                      className="related-product-image"
                    />
                    <div className="related-product-info">
                      <h3 className="related-product-title">
                        {relatedProduct.title}
                      </h3>
                      <p className="related-product-price">
                        {relatedProduct.discount > 0 ? (
                          <>
                            <span className="old-price">
                              ${Number(relatedProduct.price || 0).toFixed(2)}
                            </span>
                            <span className="new-price">
                              $
                              {(
                                Number(relatedProduct.price || 0) -
                                (Number(relatedProduct.price || 0) *
                                  relatedProduct.discount) /
                                  100
                              ).toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span>
                            ${Number(relatedProduct.price || 0).toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProductDetailPage;