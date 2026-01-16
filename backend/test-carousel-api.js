const http = require('http');

// Test GET /api/carousels
const testGetCarousels = () => {
  console.log('Testing GET /api/carousels...');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/carousels',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('GET /api/carousels Status Code:', res.statusCode);
      console.log('GET /api/carousels Response Body:', data);
      console.log('GET /api/carousels Headers:', res.headers);
      console.log('---');
    });
  });

  req.on('error', (error) => {
    console.error('GET /api/carousels Error:', error);
    console.log('---');
  });

  req.end();
};

// Test GET /api/carousels/1
const testGetCarouselById = () => {
  console.log('Testing GET /api/carousels/1...');
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/carousels/1',
    method: 'GET'
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('GET /api/carousels/1 Status Code:', res.statusCode);
      console.log('GET /api/carousels/1 Response Body:', data);
      console.log('---');
    });
  });

  req.on('error', (error) => {
    console.error('GET /api/carousels/1 Error:', error);
    console.log('---');
  });

  req.end();
};

// Test POST /api/carousels
const testPostCarousel = () => {
  console.log('Testing POST /api/carousels...');
  const carouselData = JSON.stringify({
    title: 'Test Carousel',
    description: 'Test Description',
    imageUrl: '/uploads/test.jpg',
    buttonText: 'Test Button',
    buttonLink: '/test-link',
    sortOrder: 1,
    isActive: true
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/carousels',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(carouselData)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('POST /api/carousels Status Code:', res.statusCode);
      console.log('POST /api/carousels Response Body:', data);
      console.log('---');
    });
  });

  req.on('error', (error) => {
    console.error('POST /api/carousels Error:', error);
    console.log('---');
  });

  req.write(carouselData);
  req.end();
};

// Run all tests
setTimeout(() => {
  testGetCarousels();
}, 1000);

setTimeout(() => {
  testGetCarouselById();
}, 2000);

setTimeout(() => {
  testPostCarousel();
}, 3000);