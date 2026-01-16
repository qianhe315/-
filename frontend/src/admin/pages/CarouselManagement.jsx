import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, message, Space, Typography, Tag, Row, Col, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';
import AdminLayout from '../components/Layout';
import carouselService from '../services/carouselService';

const { Title, Text } = Typography;

const CarouselManagement = () => {
  const [carousels, setCarousels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchCarousels();
  }, []);

  const fetchCarousels = async () => {
    setLoading(true);
    try {
      const result = await carouselService.getAllCarousels();
      // Map API response fields to component expected fields
      const processedCarousels = result.map(carousel => ({
        ...carousel,
        image: carousel.image_url,
        buttonText: carousel.button_text,
        buttonLink: carousel.button_link,
        sortOrder: carousel.sort_order,
        isActive: carousel.is_active === 1 || carousel.is_active === true
      }));
      setCarousels(processedCarousels);
    } catch (err) {
      message.error('Failed to fetch carousels');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCarousel = () => {
    form.resetFields();
    setEditingId(null);
    setImageUrl('');
    setSelectedFile(null);
    setIsActive(true);
    setModalVisible(true);
  };

  const handleEditCarousel = (carousel) => {
    form.setFieldsValue({
      title: carousel.title,
      description: carousel.description,
      buttonText: carousel.buttonText,
      buttonLink: carousel.buttonLink,
      sortOrder: carousel.sortOrder
    });
    setEditingId(carousel.id);
    setImageUrl(`/uploads/${carousel.image}`);
    setIsActive(carousel.isActive);
    setModalVisible(true);
  };

  const handleDeleteCarousel = async (id) => {
    try {
      await carouselService.deleteCarousel(id);
      message.success('Carousel deleted successfully');
      fetchCarousels();
    } catch (err) {
      message.error('Failed to delete carousel');
    }
  };

  // State to store the selected file
  const [selectedFile, setSelectedFile] = useState(null);

  // Handle file upload
  const handleFileUpload = (file) => {
    setImageUrl(URL.createObjectURL(file));
    setSelectedFile(file);
    return false; // Prevent default upload behavior
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Create FormData object for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description || '');
      formData.append('buttonText', values.buttonText || '');
      formData.append('buttonLink', values.buttonLink || '');
      formData.append('sortOrder', values.sortOrder || 0);
      formData.append('isActive', isActive.toString());
      
      // Append image to FormData
      if (selectedFile) {
        // If new file is selected, append the file
        formData.append('image', selectedFile);
      } else if (editingId && imageUrl) {
        // If editing and has existing image URL, extract image filename from URL
        const imageFilename = imageUrl.split('/').pop();
        formData.append('existing_image', imageFilename);
      }
      
      if (editingId) {
        // Update carousel
        await carouselService.updateCarousel(editingId, formData);
        message.success('Carousel updated successfully');
      } else {
        // Create carousel
        await carouselService.createCarousel(formData);
        message.success('Carousel created successfully');
      }
      setModalVisible(false);
      fetchCarousels();
    } catch (err) {
      console.error('Save error:', err);
      message.error(err.response?.data?.message || 'Failed to save carousel');
    } finally {
      setLoading(false);
      setSelectedFile(null); // Clear selected file after submission
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description) => (
        <Text ellipsis={{ tooltip: description || '' }}>{description || '-'}</Text>
      )
    },
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (image) => (
        <img 
          src={`/uploads/${image}`} 
          alt="Carousel" 
          style={{ width: 80, height: 45, objectFit: 'cover', borderRadius: 4 }}
        />
      )
    },
    {
      title: 'Button Text',
      dataIndex: 'buttonText',
      key: 'buttonText',
      render: (buttonText) => buttonText || '-' 
    },
    {
      title: 'Button Link',
      dataIndex: 'buttonLink',
      key: 'buttonLink',
      render: (buttonLink) => (
        <Text ellipsis={{ tooltip: buttonLink || '' }}>{buttonLink || '-'}</Text>
      )
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder'
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEditCarousel(record)}
          >
            Edit
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDeleteCarousel(record.id)}
          >
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Space direction="vertical" size="large" className="carousel-management-container">
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Carousel Management</Title>
        </Col>
        <Col>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddCarousel}
          >
            Add Carousel
          </Button>
        </Col>
      </Row>
      
      <Table 
        columns={columns} 
        dataSource={carousels} 
        rowKey="id" 
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} carousels`
        }}
      />
        
        {/* Add/Edit Carousel Modal */}
        <Modal
          title={editingId ? 'Edit Carousel' : 'Add Carousel'}
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
              <Col span={24}>
                <Form.Item
                  name="title"
                  rules={[{ required: false, message: 'Please input carousel title!' }]}
                  label="Title"
                >
                  <Input placeholder="Carousel Title" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <Input.TextArea rows={4} placeholder="Carousel Description" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="buttonText"
                  label="Button Text"
                >
                  <Input placeholder="Button Text" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="buttonLink"
                  label="Button Link"
                >
                  <Input placeholder="Button Link" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="sortOrder"
                  rules={[{ required: false, message: 'Please input sort order!' }]}
                  label="Sort Order"
                >
                  <Input type="number" placeholder="Sort Order" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Status"
                >
                  <Switch 
                    checked={isActive} 
                    onChange={setIsActive} 
                    checkedChildren="Active" 
                    unCheckedChildren="Inactive"
                  />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="image"
                  rules={[
                    {
                      required: !editingId || !imageUrl,
                      message: 'Please upload an image!'
                    }
                  ]}
                  label="Image"
                >
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {imageUrl && (
                      <div className="image-preview">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          style={{ width: 150, height: 84, objectFit: 'cover', borderRadius: 4, marginBottom: 10 }}
                        />
                        <Button 
                          type="text" 
                          icon={<CloseOutlined />} 
                          danger
                          onClick={() => {
                            setImageUrl('');
                            form.setFieldsValue({ image: null });
                          }}
                        >
                          Remove Image
                        </Button>
                      </div>
                    )}
                    <Upload
                      listType="picture-card"
                      beforeUpload={handleFileUpload}
                      customRequest={(options) => {
                        // Custom upload is handled by form submission
                        options.onSuccess();
                      }}
                      maxCount={1}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <div>
                        <UploadOutlined />
                        <div style={{ marginTop: 8 }}>Upload</div>
                      </div>
                    </Upload>
                  </Space>
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button type="primary" htmlType="submit" block loading={loading}>
                  Save Carousel
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

export default CarouselManagement;