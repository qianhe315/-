import React, { useState, useEffect } from 'react';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import api from '../services/api';
import '../styles/ProductionProcess.scss';

const ProductionProcess = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProcesses = async () => {
      setLoading(true);
      try {
        const data = await api.productionProcesses.getAll();
        setProcesses(data);
      } catch (error) {
        console.error('Error fetching production processes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProcesses();
  }, []);

  return (
    <div className="production-process-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb items={[
            { title: <a href="/">Home</a> },
            { title: <a href="/company">Company</a> },
            { title: 'Production Process' }
          ]} />
        </div>
      </section>

      {/* Production Process Section */}
      <section className="section production-process-section">
        <div className="container">
          <h1 className="page-title">Our Production Process</h1>
          <p className="section-description">
            We use advanced production techniques to ensure the highest quality products for our customers.
          </p>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading production processes...</p>
            </div>
          ) : processes.length > 0 ? (
            <div className="processes-grid">
              {processes.map((process, index) => (
                <Card key={process.id} className={`process-card ${index % 2 === 0 ? 'even' : 'odd'}`}>
                  <Row gutter={[30, 30]}>
                    <Col xs={24} md={10}>
                      <div className="process-image">
                        {process.imageUrl ? (
                          <img src={process.imageUrl} alt={process.title} />
                        ) : (
                          <div className="placeholder-image">
                            <h3>Process Image</h3>
                          </div>
                        )}
                      </div>
                    </Col>
                    <Col xs={24} md={14}>
                      <div className="process-content">
                        <h2 className="process-title">{process.title}</h2>
                        <div className="process-description">
                          {process.description.split('\n').map((paragraph, idx) => (
                            <p key={idx}>{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          ) : (
            <div className="error-container">
              <h2>No production processes found</h2>
              <p>Please check back later for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Quality Control Section */}
      <section className="section section-bg quality-control-section">
        <div className="container">
          <h2 className="section-title">Quality Control</h2>
          <Row gutter={[30, 30]}>
            <Col xs={24} md={8}>
              <Card className="quality-card">
                <div className="quality-icon">🔍</div>
                <h3>Material Inspection</h3>
                <p>All raw materials are thoroughly inspected before production begins.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="quality-card">
                <div className="quality-icon">⚙️</div>
                <h3>Production Monitoring</h3>
                <p>Each production step is monitored to ensure quality standards are met.</p>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card className="quality-card">
                <div className="quality-icon">✅</div>
                <h3>Final Testing</h3>
                <p>All finished products undergo rigorous testing before shipment.</p>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default ProductionProcess;
