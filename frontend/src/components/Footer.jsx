import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/Footer.scss';

const Footer = () => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const data = await api.contacts.getAll();
        if (data && data.length > 0) {
          setContact(data[0]);
        }
      } catch (error) {
        console.error('Error fetching contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, []);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">STAR LEAP</h3>
            <p className="footer-description">
              Professional cheerleading uniforms brand for teams around the world.
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/company/brand-story">Brand Story</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Company</h4>
            <ul className="footer-links">
              <li><Link to="/company/production">Production</Link></li>
              <li><Link to="/company/quality">Quality</Link></li>
              <li><Link to="/company/clients">Clients</Link></li>
              <li><Link to="/about">About Us</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-subtitle">Contact Us</h4>
            {!loading && contact && (
              <div className="contact-info">
                <p className="contact-item">
                  <strong>Address:</strong> {contact.address}
                </p>
                <p className="contact-item">
                  <strong>Phone:</strong> {contact.phone}
                </p>
                <p className="contact-item">
                  <strong>Email:</strong> {contact.email}
                </p>
                <p className="contact-item">
                  <strong>Website:</strong> {contact.website}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} STAR LEAP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
