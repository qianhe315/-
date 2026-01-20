import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Space, Typography, Tag, Row, Col, App } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import clientsService from '../services/clientsService';

const { Title, Text } = Typography;
const { Option } = Select;

const ClientsManagement = () => {
  const { message } = App.useApp();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await clientsService.getAllClients();
      setClients(data);
    } catch (err) {
      message.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditClient = (client) => {
    form.setFieldsValue(client);
    setEditingId(client.id);
    setModalVisible(true);
  };

  const handleDeleteClient = async (id) => {
    try {
      await clientsService.deleteClient(id);
      message.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      message.error('Failed to delete client');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingId) {
        // Update client
        await clientsService.updateClient(editingId, values);
        message.success('Client updated successfully');
      } else {
        // Create client
        await clientsService.createClient(values);
        message.success('Client created successfully');
      }
      setModalVisible(false);
      fetchClients();
    } catch (err) {
      message.error('Failed to save client');
    }
  };

  const columns = [
    {
      title: 'Client Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Industry',
      dataIndex: 'industry',
      key: 'industry'
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country'
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => <Text ellipsis={{ tooltip: description }}>{description}</Text>
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
            onClick={() => handleEditClient(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteClient(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space orientation="vertical" size="large" className="clients-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Clients Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddClient}
          >
            Add Client
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={clients} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} clients`
        }}
      />
        
        {/* Add/Edit Client Modal */}
        <Modal
          title={editingId ? 'Edit Client' : 'Add Client'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input client name!' }]}
                  label="Client Name"
                >
                  <Input placeholder="Client Name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="logoUrl"
                  rules={[{ required: true, message: 'Please input logo URL!' }]}
                  label="Logo URL"
                >
                  <Input placeholder="Logo URL" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item
              name="description"
              label="Description"
            >
              <TextArea rows={4} placeholder="Client Description" />
            </Form.Item>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="isActive"
                  label="Status"
                  initialValue={true}
                >
                  <Select placeholder="Select Status">
                    <Option value={true}>Active</Option>
                    <Option value={false}>Inactive</Option>
                  </Select>
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
                  Save Client
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

export default ClientsManagement;