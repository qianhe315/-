import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Space, Typography, Tag, Row, Col, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import adminApi from '../services/adminApi';
import '../styles/TeamMemberManagement.scss';

const { Title, Text } = Typography;

const TeamMemberManagement = () => {
  const { message } = App.useApp();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.get('/team-members/all');
      setTeamMembers(data);
    } catch (err) {
      message.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = () => {
    form.resetFields();
    setEditingId(null);
    setImageUrl('');
    setModalVisible(true);
  };

  const handleEditTeamMember = (teamMember) => {
    form.setFieldsValue({
      name: teamMember.name,
      position: teamMember.position,
      sortOrder: teamMember.sortOrder,
      isActive: teamMember.isActive
    });
    setEditingId(teamMember.id);
    setImageUrl(teamMember.imageUrl || '');
    setModalVisible(true);
  };

  const handleDeleteTeamMember = async (id) => {
    try {
      await adminApi.delete(`/team-members/${id}`);
      message.success('Team member deleted successfully');
      fetchTeamMembers();
    } catch (err) {
      message.error('Failed to delete team member');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const teamMemberData = {
        ...values,
        imageUrl: imageUrl
      };
      
      console.log('Saving team member:', teamMemberData);
      
      if (editingId) {
        await adminApi.put(`/team-members/${editingId}`, teamMemberData);
        message.success('Team member updated successfully');
      } else {
        await adminApi.post('/team-members', teamMemberData);
        message.success('Team member created successfully');
      }
      setModalVisible(false);
      fetchTeamMembers();
    } catch (err) {
      console.error('Save team member error:', err);
      message.error(`Failed to save team member: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      console.log('Uploading file:', file.name, file.size, file.type);
      
      const response = await adminApi.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Upload response:', response);
      
      setImageUrl(response.filePath);
      return false;
    } catch (err) {
      console.error('Upload error:', err);
      message.error(`Failed to upload image: ${err.response?.data?.message || err.message}`);
      return false;
    }
  };

  const handleDeleteImage = () => {
    setImageUrl('');
    message.success('Image deleted successfully');
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
      render: (text) => text
    },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl) => imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Team Member" 
          style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4 }}
        />
      ) : <Text type="secondary">No image</Text>
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditTeamMember(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteTeamMember(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space orientation="vertical" size="large" className="team-member-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Team Member Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddTeamMember}
          >
            Add Team Member
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={teamMembers} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} team members`
        }}
      />
        
      <Modal
        title={editingId ? 'Edit Team Member' : 'Add Team Member'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please input team member name!' }]}
            label="Name"
          >
            <Input placeholder="Team Member Name" />
          </Form.Item>
          
          <Form.Item
            name="position"
            rules={[{ required: true, message: 'Please input position!' }]}
            label="Position"
          >
            <Input placeholder="Position" />
          </Form.Item>
          
          <Form.Item label="Image">
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              {imageUrl ? (
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <img src={imageUrl} alt="Team Member" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 4 }} />
                  <Button 
                    type="text" 
                    icon={<CloseOutlined />} 
                    danger
                    size="small"
                    style={{ position: 'absolute', top: -8, right: -8, background: 'white', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', minWidth: 24, height: 24, padding: 0 }}
                    onClick={handleDeleteImage}
                  >
                    Delete
                  </Button>
                </div>
              ) : (
                <Upload
                  listType="picture-card"
                  beforeUpload={handleFileUpload}
                  customRequest={handleFileUpload}
                  maxCount={1}
                  showUploadList={false}
                >
                  <div>
                    <UploadOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </div>
                </Upload>
              )}
            </Space>
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isActive"
                label="Status"
                initialValue={true}
              >
                <select className="ant-input">
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sortOrder"
                label="Sort Order"
                initialValue={0}
              >
                <Input type="number" placeholder="Sort Order" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" block>
                Save Team Member
              </Button>
              <Button onClick={() => setModalVisible(false)} block>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
};

export default TeamMemberManagement;
