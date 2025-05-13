import React from "react";
import "./ContactPage.css";

const ContactPage = () => {
	return (
		<div className="contact-page">
			{/* Section 1: Contact Information */}
			<div className="section contact-info">
				<div className="contact-container">
					{/* Left Half: Text */}
					<div className="contact-text">
						<h2>Contact Us</h2>
						<p>
							Have questions or need assistance? Feel free to reach out to us.
							We're here to help!
						</p>
					</div>

					{/* Right Half: Photo */}
					<div className="contact-photo">
						<img
							src="/Logo.png"
							alt="Contact Us"
						/>
					</div>
				</div>
			</div>

			{/* Section 2: Get in Touch */}
			<div className="section get-in-touch">
				<h2>Get in Touch</h2>
				<div className="contact-details">
					<p>
						<strong>Phone:</strong>{" "}
						<a href="tel:+201157627760" className="contact-link">
							+20 115 762 7760
						</a>
					</p>
					<p>
						<strong>Email:</strong>{" "}
						<a href="mailto:support@sportsandmore.com" className="contact-link">
							support@sportsandmore.com
						</a>
					</p>
					<div className="social-icons">
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
		</div>
	);
};

export default ContactPage;
