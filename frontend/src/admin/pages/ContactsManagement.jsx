import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Typography, Tag, Row, Col } from 'antd';
const { TextArea } = Input;
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import contactsService from '../services/contactsService';

const { Title, Text } = Typography;
const { Option } = Select;

const ContactsManagement = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await contactsService.getAllContacts();
      console.log('Fetched contacts:', data);
      setContacts(data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      message.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = () => {
    form.resetFields();
    setEditingId(null);
    setModalVisible(true);
  };

  const handleEditContact = (contact) => {
    form.setFieldsValue(contact);
    setEditingId(contact.id);
    setModalVisible(true);
  };

  const handleDeleteContact = async (id) => {
    try {
      await contactsService.deleteContact(id);
      message.success('Contact deleted successfully');
      fetchContacts();
    } catch (err) {
      message.error('Failed to delete contact');
    }
  };

  const handleSubmit = async (values) => {
    try {
      console.log('Submitting contact:', values);
      let result;
      if (editingId) {
        // Update contact
        result = await contactsService.updateContact(editingId, values);
        message.success('Contact updated successfully');
      } else {
        // Create contact
        result = await contactsService.createContact(values);
        message.success('Contact created successfully');
      }
      console.log('Contact saved result:', result);
      setModalVisible(false);
      fetchContacts();
    } catch (err) {
      console.error('Error saving contact:', err);
      message.error('Failed to save contact');
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => email || '-'  
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-'  
    },
    {
      title: 'Website',
      dataIndex: 'website',
      key: 'website',
      render: (website) => <Text ellipsis={{ tooltip: website || '' }}>{website || '-'}</Text>
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address) => <Text ellipsis={{ tooltip: address || '' }}>{address || '-'}</Text>
    },
    {
      title: 'Social Media',
      dataIndex: 'socialMedia',
      key: 'socialMedia',
      render: (socialMedia) => <Text ellipsis={{ tooltip: socialMedia || '' }}>{socialMedia || '-'}</Text>
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => {
        try {
          return createdAt ? new Date(createdAt).toLocaleString() : '-';
        } catch (e) {
          console.error('Error formatting date:', e);
          return '-';
        }
      }
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
            onClick={() => handleEditContact(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteContact(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="contacts-management-container">
      <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
        <Col>
          <Title level={2}>Contacts Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddContact}
          >
            Add Contact
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={contacts || []} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} contacts`
        }}
        onRow={(record) => {
          return {
            onClick: () => console.log('Row clicked:', record)
          };
        }}
      />
      
      {/* Add/Edit Contact Modal */}
      <Modal
        title={editingId ? 'Edit Contact' : 'Add Contact'}
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
                name="email"
                rules={[{ type: 'email', message: 'Please input a valid email!' }]}
                label="Email"
              >
                <Input placeholder="Contact Email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone"
              >
                <Input placeholder="Phone Number" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="website"
            label="Website"
          >
            <Input placeholder="Website URL" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Address"
          >
            <TextArea rows={3} placeholder="Contact Address" />
          </Form.Item>
          
          <Form.Item
            name="socialMedia"
            label="Social Media"
          >
            <TextArea rows={3} placeholder="Social Media Links (JSON format)" />
          </Form.Item>
          
          <Form.Item>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" htmlType="submit" block>
                Save Contact
              </Button>
              <Button onClick={() => setModalVisible(false)} block>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactsManagement;