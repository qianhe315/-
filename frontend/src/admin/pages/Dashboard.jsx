import React from 'react';
import { Card, Statistic, Row, Col, Typography, Space } from 'antd';
import { 
  ProductOutlined, 
  AppstoreOutlined, 
  UserOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import '../styles/Dashboard.scss';

const { Title } = Typography;

const Dashboard = () => {
  // Mock data for dashboard statistics
  const statistics = [
    {
      title: 'Total Products',
      value: 128,
      icon: <ProductOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Categories',
      value: 12,
      icon: <AppstoreOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Clients',
      value: 56,
      icon: <UserOutlined />,
      color: '#faad14'
    },
    {
      title: 'Quality Certifications',
      value: 8,
      icon: <CheckCircleOutlined />,
      color: '#f5222d'
    }
  ];

  return (
    <Space orientation="vertical" size="large" className="dashboard-container">
      <Title level={2}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        {statistics.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activities" hoverable>
            <p>• Product "Cheerleading Uniform Set" updated</p>
            <p>• New category "Dance Costumes" added</p>
            <p>• Quality certification "ISO 9001" renewed</p>
            <p>• Client "Star Cheer Team" added</p>
            <p>• Production process "Embroidery" updated</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="System Status" hoverable>
            <p>• Database: Connected</p>
            <p>• API: Running</p>
            <p>• File Storage: Available</p>
            <p>• Last Backup: 2024-01-13 00:00</p>
            <p>• System Version: 1.0.0</p>
          </Card>
        </Col>
      </Row>
    </Space>
  );
};

export default Dashboard;
