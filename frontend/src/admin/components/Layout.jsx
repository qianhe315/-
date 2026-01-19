import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Typography, Button, Avatar, Dropdown, Space, Breadcrumb } from 'antd';
import { 
  DashboardOutlined, 
  ProductOutlined, 
  FileTextOutlined, 
  SettingOutlined, 
  UserOutlined, 
  LogoutOutlined,
  FormOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
  AppstoreOutlined,
  SlidersOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Layout.scss';

const { Header, Content, Sider } = AntLayout;
const { Title } = Typography;

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [current, setCurrent] = useState('dashboard');
  const [adminInfo, setAdminInfo] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      navigate('/admin/login');
    } else {
        setAdminInfo(authService.getCurrentAdmin());
        // Update current menu item based on path
        const pathname = location.pathname;
        if (pathname.includes('products')) setCurrent('products');
        else if (pathname.includes('categories')) setCurrent('categories');
        else if (pathname.includes('company-info')) setCurrent('company-info');
        else if (pathname.includes('team-members')) setCurrent('team-members');
        else if (pathname.includes('production')) setCurrent('production');
        else if (pathname.includes('quality')) setCurrent('quality');
        else if (pathname.includes('clients')) setCurrent('clients');
        else if (pathname.includes('contacts')) setCurrent('contacts');
        else if (pathname.includes('carousel')) setCurrent('carousel');
        else setCurrent('dashboard');
      }
  }, [location, navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/admin/login');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/admin">Dashboard</Link>
    },

    {
      key: 'products',
      icon: <ProductOutlined />,
      label: <Link to="/admin/products">Products</Link>
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: <Link to="/admin/categories">Categories</Link>
    },
    {
      key: 'company-info',
      icon: <FileTextOutlined />,
      label: <Link to="/admin/company-info">Company Info</Link>
    },
    {
      key: 'team-members',
      icon: <TeamOutlined />,
      label: <Link to="/admin/team-members">Team Members</Link>
    },
    {
      key: 'production',
      icon: <FormOutlined />,
      label: <Link to="/admin/production">Production</Link>
    },
    {
      key: 'quality',
      icon: <CheckCircleOutlined />,
      label: <Link to="/admin/quality">Quality</Link>
    },
    {
      key: 'clients',
      icon: <CustomerServiceOutlined />,
      label: <Link to="/admin/clients">Clients</Link>
    },
    {
      key: 'contacts',
      icon: <PhoneOutlined />,
      label: <Link to="/admin/contacts">Contacts</Link>
    },
    {
      key: 'carousel',
      icon: <SlidersOutlined />,
      label: <Link to="/admin/carousel">Carousel</Link>
    }
  ];

  const userMenu = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <SettingOutlined />
    },
    {
      type: 'divider'
    },
    {
      key: 'logout',
      label: 'Logout',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout
    }
  ];

  return (
    <AntLayout className="admin-layout">
      <Sider trigger={null} collapsible collapsed={collapsed} className="admin-sider">
        <div className="admin-logo">
          <Title level={3} style={{ color: 'white', margin: 0, textAlign: 'center' }}>
            {collapsed ? 'SL' : 'Star Leap'}
          </Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[current]}
          items={menuItems}
          onClick={({ key }) => setCurrent(key)}
        />
      </Sider>
      <AntLayout className="admin-main-layout">
        <Header className="admin-header">
          <Space className="header-left">
            <Button
              type="text"
              icon={collapsed ? <DashboardOutlined /> : <DashboardOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="admin-trigger"
            />
            <Breadcrumb>
              <Breadcrumb.Item>Admin</Breadcrumb.Item>
              <Breadcrumb.Item>{current.charAt(0).toUpperCase() + current.slice(1)}</Breadcrumb.Item>
            </Breadcrumb>
          </Space>
          <Space className="header-right">
            <Dropdown menu={{ items: userMenu }}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                <span>{adminInfo?.name}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content className="admin-content">
          <div className="admin-content-wrapper">
            {children}
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AdminLayout;
