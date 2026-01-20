import React, { useState, useEffect } from 'react';
import { Breadcrumb, Card, Spin, Row, Col } from 'antd';
import api from '../services/api';
import { getClientLogoUrl } from '../utils/imageUtils';
import '../styles/Clients.scss';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const data = await api.clients.getAll();
        setClients(data);
      } catch (error) {
        console.error('Error fetching clients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return (
    <div className="clients-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb items={[
            { title: <a href="/">Home</a> },
            { title: <a href="/company">Company</a> },
            { title: 'Our Clients' }
          ]} />
        </div>
      </section>

      {/* Clients Section */}
      <section className="section clients-section">
        <div className="container">
          <h1 className="page-title">Our Clients</h1>
          <p className="section-description">
            We are proud to work with these amazing clients and partners.
          </p>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading clients...</p>
            </div>
          ) : clients.length > 0 ? (
            <div className="clients-grid">
              {clients.map((client) => (
                <Card key={client.id} className="client-card">
                  <div className="client-content">
                    <div className="client-logo">
                      <img src={getClientLogoUrl(client)} alt={client.name} />
                    </div>
                    <div className="client-info">
                      <h2 className="client-name">{client.name}</h2>
                      {client.description && (
                        <div className="client-description">
                          {client.description.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="error-container">
              <h2>No clients found</h2>
              <p>Please check back later for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section section-bg testimonials-section">
        <div className="container">
          <h2 className="section-title">Client Testimonials</h2>
          <div className="testimonials-grid">
            <Card className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "We've been working with Star Leap for over 5 years and their uniforms are simply the best. The quality and design are unmatched."
                </p>
                <h3 className="testimonial-author">- John Doe, Coach</h3>
              </div>
            </Card>
            <Card className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "The custom design service was amazing! They brought our vision to life perfectly. Our team loves their new uniforms."
                </p>
                <h3 className="testimonial-author">- Jane Smith, Team Captain</h3>
              </div>
            </Card>
            <Card className="testimonial-card">
              <div className="testimonial-content">
                <p className="testimonial-text">
                  "Fast production and excellent customer service. We'll definitely be ordering again next season."
                </p>
                <h3 className="testimonial-author">- Mike Johnson, Director</h3>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Clients;
