const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test image upload
async function testImageUpload() {
  try {
    const form = new FormData();
    
    // Create a test image file if it doesn't exist
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      console.log('Test image not found, skipping upload test');
      return;
    }
    
    form.append('file', fs.createReadStream(testImagePath), 'test-image.jpg');
    
    const response = await fetch('http://localhost:3001/api/media/upload', {
      method: 'POST',
      headers: form.getHeaders(),
      body: form
    });
    
    const result = await response.json();
    console.log('Upload test result:', result);
  } catch (error) {
    console.error('Upload test error:', error);
  }
}

testImageUpload();
