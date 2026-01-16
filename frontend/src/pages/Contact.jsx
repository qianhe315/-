import React, { useState, useEffect } from 'react';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import api from '../services/api';
import '../styles/Contact.scss';

const Contact = () => {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      setLoading(true);
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
    <div className="contact-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb>
            <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
            <Breadcrumb.Item>Contact</Breadcrumb.Item>
          </Breadcrumb>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section contact-section">
        <div className="container">
          <h1 className="page-title">Contact Us</h1>
          <p className="section-description">
            We'd love to hear from you! Please feel free to contact us using the information below.
          </p>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading contact information...</p>
            </div>
          ) : contact ? (
            <div className="contact-content">
              <Row gutter={[40, 40]}>
                <Col xs={24} md={12}>
                  <Card className="contact-card">
                    <h2 className="contact-title">Contact Information</h2>
                    <div className="contact-details">
                      {contact.address && (
                        <div className="contact-item">
                          <strong>Address:</strong>
                          <p>{contact.address}</p>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="contact-item">
                          <strong>Phone:</strong>
                          <p>{contact.phone}</p>
                        </div>
                      )}
                      {contact.email && (
                        <div className="contact-item">
                          <strong>Email:</strong>
                          <p>{contact.email}</p>
                        </div>
                      )}
                      {contact.website && (
                        <div className="contact-item">
                          <strong>Website:</strong>
                          <p>{contact.website}</p>
                        </div>
                      )}
                    </div>
                  </Card>
                  <Card className="contact-card mt-30">
                    <h2 className="contact-title">Business Hours</h2>
                    <div className="business-hours">
                      <div className="hour-item">
                        <strong>Monday - Friday:</strong>
                        <p>9:00 AM - 6:00 PM</p>
                      </div>
                      <div className="hour-item">
                        <strong>Saturday:</strong>
                        <p>10:00 AM - 4:00 PM</p>
                      </div>
                      <div className="hour-item">
                        <strong>Sunday:</strong>
                        <p>Closed</p>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <div className="map-container">
                    <div className="placeholder-map">
                      <h3>Map Location</h3>
                      <p>Interactive map will be displayed here</p>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="error-container">
              <h2>Contact information not found</h2>
              <p>Please check back later for more information.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
