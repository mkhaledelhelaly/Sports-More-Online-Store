import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* Section 1: About Us */}
      <div className="section about-us">
        <div className="about-us-container">
          {/* Left Half: Text */}
          <div className="about-us-text">
            <h2>About Us</h2>
            <p>
              Welcome to Sports&More! We are passionate about providing the best
              sports gear and accessories to help you achieve your goals. Our
              mission is to inspire and empower athletes of all levels with
              high-quality products and exceptional service.
            </p>
          </div>

          {/* Right Half: Photo */}
          <div className="about-us-photo">
            <img
              src="/Logo.png"
              alt="About Us"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Our Mission */}
      <div className="section our-mission">
        <h2>Our Mission</h2>
        <div className="mission-content">
          <p>
            At Sports&More, we believe in the power of sports to bring people
            together and create positive change. Our mission is to provide
            athletes with the tools they need to succeed, whether they're
            training for their first marathon or competing at the highest
            level.
          </p>
        </div>
      </div>

      {/* Section 3: Our Team */}
      <div className="section our-team">
        <h2>Our Team</h2>
        <div className="team-content">
          <p>
            Our team is made up of passionate sports enthusiasts who are
            dedicated to helping you find the perfect gear for your needs. We
            are here to support you every step of the way.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;