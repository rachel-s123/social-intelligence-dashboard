// Quick API Key Tester
// Usage: node scripts/test-api-key.js YOUR_API_KEY_HERE

const axios = require('axios');

async function testApiKey(apiKey) {
  if (!apiKey) {
    console.log('❌ No API key provided');
    console.log('Usage: node scripts/test-api-key.js YOUR_API_KEY_HERE');
    console.log('Example: node scripts/test-api-key.js abc123def456');
    return;
  }

  console.log(`🔑 Testing API key: ${apiKey.substring(0, 10)}...`);

  try {
    const response = await axios.get('https://redditslapi-production.up.railway.app/status', {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    console.log('✅ API key is valid!');
    console.log('📊 API Status:', response.data);

    // Test a simple search
    console.log('\n🔍 Testing search functionality...');
    const searchResponse = await axios.post('https://redditslapi-production.up.railway.app/analyze-search', {
      query: 'BMW motorcycle',
      limit: 2,
      time: 'week'
    }, {
      headers: {
        'X-API-Key': apiKey,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Search successful! Found ${searchResponse.data.comment_analyses?.length || 0} analyses`);

    return true;

  } catch (error) {
    const status = error.response?.status;
    const errorMsg = error.response?.data?.detail || error.message;

    console.log(`❌ API key test failed (${status}):`, errorMsg);
    return false;
  }
}

// CLI usage
if (require.main === module) {
  const apiKey = process.argv[2];
  testApiKey(apiKey);
}
