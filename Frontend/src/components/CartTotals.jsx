import React from "react";
import { useNavigate } from "react-router-dom";

const CartTotals = ({ items, showCheckoutButton = true, state, discount = 0 }) => {
  const navigate = useNavigate();
  console.log("Items in CartTotals:", items); // Debugging line
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  console.log("Subtotal:", subtotal); // Debugging line
  const shippingFee = state?.toLowerCase() === "cairo" ? 5 : 10;
  const total = showCheckoutButton
    ? subtotal - (subtotal * discount) / 100
    : subtotal + shippingFee - (subtotal * discount) / 100;

  return (
    <div className="cart-totals">
      <h2>Cart Totals</h2>
      <div className="totals-row">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {!showCheckoutButton && (
        <div className="totals-row">
          <span>Shipping Fee</span>
          <span>${shippingFee.toFixed(2)}</span>
        </div>
      )}
      {discount > 0 && (
        <div className="totals-row">
          <span>Discount</span>
          <span>-${((subtotal * discount) / 100).toFixed(2)}</span>
        </div>
      )}
      <div className="totals-row total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      {showCheckoutButton && (
        <>
          <button className="checkout-button" onClick={() => navigate("/checkout")}>
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
};

export default CartTotals;