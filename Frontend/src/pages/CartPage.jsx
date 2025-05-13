import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import CartItems from "../components/CartItems";
import CartTotals from "../components/CartTotals";
import { CartContext } from "../context/CartContext";
import "./CartPage.css";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { fetchCartCount } = useContext(CartContext); // Access fetchCartCount from context
    const navigate = useNavigate();

    // Fetch cart data from the backend
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
                    headers: {
                        token: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                setCartItems(response.data.products.filter((item) => item.product));
                setLoading(false);
            } catch (err) {
                console.error("Error fetching cart:", err.message);
                setError("Failed to load cart. Please try again later.");
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const handleQuantityChange = async (cartItemId, increment) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/cart/updateCart`,
                { cartItemId, quantity: increment },
                {
                    headers: {
                        token: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            setCartItems(response.data.products);
            fetchCartCount(); // Update cart count after quantity change
        } catch (err) {
            console.error("Error updating quantity:", err.message);
        }
    };

    const handleRemoveItem = async (id, size, color) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(
                `${import.meta.env.VITE_BACKEND_URL}/api/cart/removeProduct/${id}`,
                {
                    headers: {
                        token: `Bearer ${token}`,
                    },
                    data: { size, color },
                }
            );

            toast.success("Item removed from cart successfully!", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            setCartItems(response.data.products);
            fetchCartCount(); // Update cart count after item removal
        } catch (err) {
            console.error("Error removing item:", err.message);

            toast.error("Failed to remove item. Please try again.", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    if (loading) return <p>Loading cart...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="cart-page">
            <h1>Your Cart</h1>
            {cartItems.length === 0 ? (
                <div className="empty-cart">
                    <p>Your cart is empty!</p>
                    <button
                        className="continue-shopping-button"
                        onClick={() => navigate("/collection")}
                    >
                        Continue Shopping
                    </button>
                </div>
            ) : (
                <div className="cart-content">
                    <CartItems
                        items={cartItems}
                        onQuantityChange={handleQuantityChange}
                        onRemoveItem={handleRemoveItem}
                    />
                    <CartTotals items={cartItems} />
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default CartPage;