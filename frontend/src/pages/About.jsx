import React, { useState, useEffect } from 'react';
import { Breadcrumb, Row, Col, Card, Spin } from 'antd';
import api from '../services/api';
import '../styles/About.scss';

const About = () => {
  const [aboutUs, setAboutUs] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [aboutData, teamData] = await Promise.all([
          api.companyInfo.getByType('about_us'),
          api.teamMembers.getAll()
        ]);
        setAboutUs(aboutData);
        setTeamMembers(teamData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="about-page">
      {/* Breadcrumb */}
      <section className="breadcrumb-section">
        <div className="container">
          <Breadcrumb items={[
            { title: <a href="/">Home</a> },
            { title: 'About Us' }
          ]} />
        </div>
      </section>

      {/* About Section */}
      <section className="section about-section">
        <div className="container">
          <h1 className="page-title">About Us</h1>
          
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>Loading about us...</p>
            </div>
          ) : aboutUs ? (
            <div className="about-content">
              <Row gutter={[40, 40]}>
                <Col xs={24} md={12}>
                  <div className="about-text">
                    <h2>{aboutUs.title}</h2>
                    <div className="content">
                      {aboutUs.content.split('\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={12}>
                  <div className="about-image">
                    {aboutUs.imageUrl ? (
                      <img src={aboutUs.imageUrl} alt="About Us" className="about-main-image" />
                    ) : (
                      <div className="placeholder-image">
                        <h3>About Us Image</h3>
                      </div>
                    )}
                    <Card className="about-card">
                      <h3>Our Team</h3>
                      <p>We are a dedicated team of professionals with years of experience in the cheerleading apparel industry.</p>
                    </Card>
                    <Card className="about-card">
                      <h3>Our Values</h3>
                      <p>Excellence, innovation, integrity, and passion are the core values that drive our business.</p>
                    </Card>
                  </div>
                </Col>
              </Row>
            </div>
          ) : (
            <div className="error-container">
              <h2>About us information not found</h2>
              <p>Please check back later for more information.</p>
            </div>
          )}
        </div>
      </section>

      {/* Team Section */}
      <section className="section section-bg team-section">
        <div className="container">
          <h2 className="section-title">Our Team</h2>
          <div className="team-grid">
            {teamMembers.length > 0 ? (
              teamMembers.map((member) => (
                <Card key={member.id} className="team-card">
                  <div className="team-member">
                    <div className="member-image">
                      {member.imageUrl ? (
                        <img src={member.imageUrl} alt={member.name} className="member-avatar" />
                      ) : (
                        <div className="placeholder-avatar">
                          <h3>{member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</h3>
                        </div>
                      )}
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">{member.name}</h3>
                      <p className="member-position">{member.position}</p>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <>
                <Card className="team-card">
                  <div className="team-member">
                    <div className="member-image">
                      <div className="placeholder-avatar">
                        <h3>JD</h3>
                      </div>
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">John Doe</h3>
                      <p className="member-position">CEO & Founder</p>
                    </div>
                  </div>
                </Card>
                <Card className="team-card">
                  <div className="team-member">
                    <div className="member-image">
                      <div className="placeholder-avatar">
                        <h3>JS</h3>
                      </div>
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">Jane Smith</h3>
                      <p className="member-position">Design Director</p>
                    </div>
                  </div>
                </Card>
                <Card className="team-card">
                  <div className="team-member">
                    <div className="member-image">
                      <div className="placeholder-avatar">
                        <h3>MD</h3>
                      </div>
                    </div>
                    <div className="member-info">
                      <h3 className="member-name">Mike Johnson</h3>
                      <p className="member-position">Production Manager</p>
                    </div>
                  </div>
                </Card>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
