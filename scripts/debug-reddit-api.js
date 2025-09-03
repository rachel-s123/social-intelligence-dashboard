// Debug Reddit API Key Issues
// This script helps diagnose API key problems

const axios = require('axios');

async function debugRedditAPI() {
  console.log('🔧 Debugging Reddit API Key Issues...\n');

  // Test 1: Health endpoint (should work without API key)
  console.log('1️⃣ Testing health endpoint (no auth required)...');
  try {
    const healthResponse = await axios.get('https://redditslapi-production.up.railway.app/health');
    console.log('✅ Health check successful:', healthResponse.data);
  } catch (error) {
    console.error('❌ Health check failed:', error.response?.data || error.message);
  }

  // Test 2: Status endpoint with API key
  console.log('\n2️⃣ Testing status endpoint with API key...');

  // Try different API keys or get from user
  const testKeys = [
    'z12PLfCDJlbNDgAKi4uolswQVzeJWmmZQYjEsoQ857gy', // Current key
    process.env.REDDIT_API_KEY, // From environment
    'test-key', // Placeholder
  ];

  for (const key of testKeys) {
    if (!key) continue;

    console.log(`\n🔑 Testing API key: ${key.substring(0, 10)}...`);

    try {
      const response = await axios.get('https://redditslapi-production.up.railway.app/status', {
        headers: {
          'X-API-Key': key,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ API key works! Response:', response.data);
      return; // Success, exit

    } catch (error) {
      const status = error.response?.status;
      const errorMsg = error.response?.data?.detail || error.message;

      console.log(`❌ API key failed (${status}):`, errorMsg);
    }
  }

  // Test 3: Try analyze-search endpoint (this requires auth)
  console.log('\n3️⃣ Testing analyze-search endpoint...');
  try {
    const searchResponse = await axios.post('https://redditslapi-production.up.railway.app/analyze-search', {
      query: 'test',
      limit: 1,
      time: 'day'
    }, {
      headers: {
        'X-API-Key': process.env.REDDIT_API_KEY || 'z12PLfCDJlbNDgAKi4uolswQVzeJWmmZQYjEsoQ857gy',
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log('✅ Search endpoint works! Found:', searchResponse.data.comment_analyses?.length || 0, 'results');

  } catch (error) {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.detail || error.message;

    console.log(`❌ Search endpoint failed (${status}):`, errorMsg);
  }

  console.log('\n📋 Troubleshooting Steps:');
  console.log('1. Check if your API key is correct');
  console.log('2. Verify the key hasn\'t expired');
  console.log('3. Contact your team admin for the correct API key');
  console.log('4. Check if the API service is running properly');
  console.log('5. Try the API documentation for key format requirements');
}

// CLI usage
if (require.main === module) {
  require('dotenv').config();
  debugRedditAPI().catch(console.error);
}
