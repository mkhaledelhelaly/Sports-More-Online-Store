import React from "react";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* About Us Section */}
        <div className="footer-about">
          <h3>About Us</h3>
          <p>
            We are dedicated to providing the best products and services to our
            customers. Your satisfaction is our priority.
          </p>
        </div>

        {/* Get in Touch Section */}
        <div className="footer-contact">
          <h3>Get in Touch</h3>
          <p>
            <a href="tel:+201157627760" className="footer-phone">
              +20 115 762 7760
            </a>
          </p>
          <div className="footer-socials">
            <a
              href="https://www.instagram.com/mostafanasr67"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="fab fa-instagram"></i>
            </a>
            <a
              href="https://www.facebook.com/MNWorkouts"
              target="_blank"
              rel="noopener noreferrer"
              className="social-icon"
            >
              <i className="fab fa-facebook"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Horizontal Line */}
      <hr className="footer-line" />

      {/* Copyright Section */}
      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;