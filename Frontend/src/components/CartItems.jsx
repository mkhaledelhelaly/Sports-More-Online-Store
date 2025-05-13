import React from "react";
import "./Cartitems.css"; // Import your CSS file for styling

const CartItems = ({ items, onQuantityChange, onRemoveItem }) => {

    return (
        <div className="cart-items">
            {items.map((item) => (
                <div key={item._id} className="cart-item">
                    {item.product && item.product.images && item.product.images[0] ? (
                        <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="cart-item-image"
                        />
                    ) : (
                        <div className="cart-item-placeholder">Image not available</div>
                    )}
                    <div className="cart-item-details">
                        <h3>{item.product?.title || "Unknown Product"}</h3>
                        <p>Price: ${item.price || "N/A"}</p>
                        <p>Size: {item.size || "N/A"}</p>
                        <p>Color: {item.color || "N/A"}</p>
                    </div>
                    <div className="cart-item-actions">
                        <div className="quantity-control">
                            <button
                                className="quantity-button"
                                onClick={() => onQuantityChange(item._id, -1)} // Decrease quantity
                            >
                                -
                            </button>
                            <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                readOnly
                                className="quantity-input"
                            />
                            <button
                                className="quantity-button"
                                onClick={() => onQuantityChange(item._id, 1)} // Increase quantity
                            >
                                +
                            </button>
                        </div>
                        <button
                            className="remove-button"
                            onClick={() =>
                                onRemoveItem(item.product?._id, item.size, item.color)
                            }
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CartItems;
