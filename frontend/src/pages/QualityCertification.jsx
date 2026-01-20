import React, { useState, useEffect } from 'react';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import api from '../services/api';
import '../styles/QualityCertification.scss';

const QualityCertification = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertifications = async () => {
      setLoading(true);
      try {
        const data = await api.qualityCertifications.getAll();
        setCertifications(data);
      } catch (error) {
        console.error('Error fetching quality certifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertifications();
  }, []);

  return (
    <div className="quality-certification-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb items={[
            { title: <a href="/">Home</a> },
            { title: <a href="/company">Company</a> },
            { title: 'Quality Certifications' }
          ]} />
        </div>
      </section>

      {/* Quality Certification Section */}
      <section className="section quality-certification-section">
        <div className="container">
          <h1 className="page-title">Quality Certifications</h1>
          <p className="section-description">
            We are committed to maintaining the highest quality standards in all our products and processes.
          </p>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading certifications...</p>
            </div>
          ) : certifications.length > 0 ? (
            <div className="certifications-grid">
              {certifications.map((certification) => (
                <Card key={certification.id} className="certification-card">
                  <div className="certification-content">
                    <div className="certification-image">
                      <img src={certification.imageUrl} alt={certification.name} />
                    </div>
                    <div className="certification-info">
                      <h2 className="certification-name">{certification.name}</h2>
                      {certification.description && (
                        <div className="certification-description">
                          {certification.description.split('\n').map((paragraph, idx) => (
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
              <h2>No certifications found</h2>
              <p>Please check back later for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quality Commitment Section */}
      <section className="section section-bg quality-commitment-section">
        <div className="container">
          <h2 className="section-title">Our Quality Commitment</h2>
          <div className="commitment-grid">
            <div className="commitment-item">
              <div className="commitment-icon">🔒</div>
              <h3>Quality Assurance</h3>
              <p>We implement strict quality control measures at every stage of production.</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-icon">📋</div>
              <h3>Standards Compliance</h3>
              <p>Our products meet or exceed international quality standards.</p>
            </div>
            <div className="commitment-item">
              <div className="commitment-icon">🔄</div>
              <h3>Continuous Improvement</h3>
              <p>We constantly improve our processes to enhance product quality.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default QualityCertification;
