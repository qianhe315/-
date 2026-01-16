const http = require('http');

// Test GET /api/categories
const testGetCategories = () => {
  console.log('Testing GET /api/categories...');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/categories',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('GET /api/categories Status Code:', res.statusCode);
      console.log('GET /api/categories Response Body:', data);
      console.log('---');
    });
  });

  req.on('error', (error) => {
    console.error('GET /api/categories Error:', error);
    console.log('---');
  });

  req.end();
};

// Test GET /
const testGetRoot = () => {
  console.log('Testing GET /...');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('GET / Status Code:', res.statusCode);
      console.log('GET / Response Body:', data);
      console.log('---');
    });
  });

  req.on('error', (error) => {
    console.error('GET / Error:', error);
    console.log('---');
  });

  req.end();
};

// Run tests
testGetRoot();
testGetCategories();