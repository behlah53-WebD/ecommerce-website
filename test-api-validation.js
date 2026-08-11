const axios = require('axios');

const API_BASE = 'http://localhost:3000';

async function testValidation() {
  console.log('Testing backend validation...\n');
  
  // Test 1: Invalid email (not .com)
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "test@example.org",
      password: "Password1!"
    });
    console.log('❌ Test 1 FAILED: Should reject non-.com email');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 1 PASSED: Correctly rejects non-.com email');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 1 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 2: Invalid password (no capital)
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "test@example.com",
      password: "password1!"
    });
    console.log('❌ Test 2 FAILED: Should reject password without capital');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 2 PASSED: Correctly rejects password without capital');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 2 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 3: Invalid password (no digit)
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "test@example.com",
      password: "Password!"
    });
    console.log('❌ Test 3 FAILED: Should reject password without digit');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 3 PASSED: Correctly rejects password without digit');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 3 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 4: Invalid password (no special char)
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "test@example.com",
      password: "Password1"
    });
    console.log('❌ Test 4 FAILED: Should reject password without special char');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 4 PASSED: Correctly rejects password without special char');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 4 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 5: Invalid password (not enough lowercase)
  try {
    await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "test@example.com",
      password: "Pass1!"
    });
    console.log('❌ Test 5 FAILED: Should reject password with insufficient lowercase');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 5 PASSED: Correctly rejects password with insufficient lowercase');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 5 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 6: Valid signup
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      name: "Test User",
      email: "validuser@example.com",
      password: "Password1!"
    });
    console.log('✅ Test 6 PASSED: Valid signup works');
    console.log('   Response:', response.data.message);
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log('⚠️ Test 6 SKIPPED: User already exists (expected in subsequent runs)');
    } else {
      console.log('❌ Test 6 FAILED: Valid signup rejected', error.response?.data || error.message);
    }
  }
  
  // Test 7: Login with invalid email
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: "invalid-email",
      password: "Password1!"
    });
    console.log('❌ Test 7 FAILED: Should reject invalid email format');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 7 PASSED: Correctly rejects invalid email format');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 7 FAILED: Unexpected error', error.message);
    }
  }
  
  // Test 8: Login with non-.com email
  try {
    await axios.post(`${API_BASE}/auth/login`, {
      email: "test@example.org",
      password: "Password1!"
    });
    console.log('❌ Test 8 FAILED: Should reject non-.com email');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      console.log('✅ Test 8 PASSED: Correctly rejects non-.com email');
      console.log('   Error:', error.response.data.errors.join(', '));
    } else {
      console.log('❌ Test 8 FAILED: Unexpected error', error.message);
    }
  }
  
  console.log('\nValidation testing complete!');
}

// Run tests
testValidation().catch(console.error);