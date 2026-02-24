/**
 * Test script to diagnose OTP endpoint issues
 * Run with: node test_otp_endpoint.js
 */

require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_EMAIL = 'test@example.com';

async function testHealthEndpoint() {
  console.log('\n🔍 Testing Health Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function testOTPEndpoint() {
  console.log('\n🔍 Testing OTP Signup Endpoint...');
  try {
    const response = await axios.post(`${API_URL}/api/auth/send-otp-signup`, {
      email: TEST_EMAIL
    });
    console.log('✅ OTP Response:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ OTP Request Failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('========================================');
  console.log('🧪 OTP Endpoint Diagnostic Test');
  console.log(`📍 API URL: ${API_URL}`);
  console.log('========================================');

  const healthOk = await testHealthEndpoint();
  
  if (healthOk) {
    await testOTPEndpoint();
  } else {
    console.log('\n⚠️  Skipping OTP test due to health check failure');
  }

  console.log('\n========================================');
  console.log('✅ Test Complete');
  console.log('========================================\n');
}

runTests();
