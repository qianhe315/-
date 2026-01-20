const axios = require('axios');

async function testCompanyInfoAPI() {
  try {
    console.log('Testing Company Info API...\n');
    
    const baseURL = 'http://localhost:3001/api';
    
    console.log('1. Testing GET /company-info');
    const response1 = await axios.get(`${baseURL}/company-info`);
    console.log('Response:', JSON.stringify(response1.data, null, 2));
    console.log(`Status: ${response1.status}\n`);
    
    console.log('2. Testing POST /company-info');
    const newCompanyInfo = {
      title: 'Test Company Info',
      content: 'This is a test content',
      type: 'brand_story',
      isActive: true
    };
    const response2 = await axios.post(`${baseURL}/company-info`, newCompanyInfo);
    console.log('Response:', JSON.stringify(response2.data, null, 2));
    console.log(`Status: ${response2.status}\n`);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error occurred:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

testCompanyInfoAPI();
