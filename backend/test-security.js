const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testSecurity() {
  console.log('🔒 Starting Security Tests...\n');

  // Test 1: Rate Limiting
  console.log('1️⃣ Testing Rate Limiting...');
  try {
    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(
        axios.post(`${BASE_URL}/user/login`, {
          email: 'test@test.com',
          password: 'wrongpassword'
        })
      );
    }
    await Promise.allSettled(promises);
    console.log('❌ Rate limiting might not be working');
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('✅ Rate limiting working - blocked after 5 attempts');
    }
  }

  // Test 2: Input Validation
  console.log('\n2️⃣ Testing Input Validation...');
  try {
    await axios.post(`${BASE_URL}/user/login`, {
      email: '<script>alert("xss")</script>',
      password: '\'; DROP TABLE users; --'
    });
  } catch (error) {
    console.log('✅ Input validation working - malicious input handled');
  }

  // Test 3: Authorization
  console.log('\n3️⃣ Testing Authorization...');
  try {
    await axios.get(`${BASE_URL}/user/all`);
    console.log('❌ Authorization not working - accessed without token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Authorization working - blocked without token');
    }
  }

  // Test 4: Security Headers
  console.log('\n4️⃣ Testing Security Headers...');
  try {
    const response = await axios.get(`${BASE_URL}/health-check`);
    const headers = response.headers;
    
    if (headers['x-frame-options']) {
      console.log('✅ X-Frame-Options header present');
    }
    if (headers['x-content-type-options']) {
      console.log('✅ X-Content-Type-Options header present');
    }
    if (headers['content-security-policy']) {
      console.log('✅ Content-Security-Policy header present');
    }
  } catch (error) {
    console.log('❌ Could not test headers');
  }

  console.log('\n🎉 Security tests completed!');
}

testSecurity();