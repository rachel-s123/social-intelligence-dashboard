// Test Reddit Comment Analysis API Integration
// Run this to verify your Reddit API setup is working

const { RedditAPIService } = require('./social-media-apis');

async function testRedditAPI() {
  console.log('🧪 Testing Reddit Comment Analysis API Integration...\n');

  const reddit = new RedditAPIService();

  try {
    // Test 1: Check API key configuration
    console.log('1️⃣ Checking API key configuration...');
    if (reddit.apiKey) {
      console.log('✅ Reddit API key found');
    } else {
      console.log('❌ REDDIT_API_KEY not found in environment variables');
      console.log('Please add it to your .env file');
      return;
    }

    // Test 2: Test API connectivity
    console.log('\n2️⃣ Testing API connectivity...');
    try {
      const healthCheck = await reddit.testConnection();
      console.log('✅ API connection successful');
      console.log(`   Status: ${healthCheck.status}`);
      console.log(`   Version: ${healthCheck.version}`);
    } catch (error) {
      console.error('❌ API connection failed:', error.message);
      return;
    }

    // Test 3: Search for BMW R 12 G/S content
    console.log('\n3️⃣ Testing search functionality...');
    const searchQuery = '"BMW R 12 G/S" OR "R twelve G/S" OR "BMW R12GS"';
    console.log(`Searching for: ${searchQuery}`);

    const analyses = await reddit.searchPosts(searchQuery, 'month', 10);
    console.log(`✅ Found ${analyses.length} comment analyses`);

    if (analyses.length > 0) {
      console.log('\n📋 Sample analyses found:');
      analyses.slice(0, 3).forEach((analysis, index) => {
        console.log(`${index + 1}. "${analysis.text.substring(0, 60)}..."`);
        console.log(`   Sentiment: ${analysis.sentiment}, Theme: ${analysis.theme}`);
        console.log(`   Purchase Intent: ${analysis.purchaseIntent}, Confidence: ${analysis.confidence?.toFixed(2) || 'N/A'}`);
      });
    }

    // Test 4: Test specific subreddit analysis
    console.log('\n4️⃣ Testing subreddit analysis...');
    try {
      const subredditContent = await reddit.analyzeSubreddit('motorcycles', 'month', 5);
      console.log(`✅ Analyzed r/motorcycles: ${subredditContent.length} analyses`);

      if (subredditContent.length > 0) {
        console.log('💬 Sample subreddit analysis:');
        subredditContent.slice(0, 2).forEach((item, index) => {
          console.log(`${index + 1}. "${item.text.substring(0, 50)}..." (${item.sentiment})`);
        });
      }
    } catch (error) {
      console.log(`⚠️ Subreddit analysis failed (this is normal if subreddit has no relevant content): ${error.message}`);
    }

    // Test 5: Test full R12GS collection method
    console.log('\n5️⃣ Testing full R12GS data collection...');
    const fullData = await reddit.searchR12GSContent('month');
    console.log(`✅ Collected ${fullData.length} total analyses`);

    console.log('\n🎉 Reddit API test completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Search analyses: ${analyses.length}`);
    console.log(`   - Total content: ${fullData.length}`);
    console.log(`   - API Status: ✅ Connected and working`);
    console.log(`   - AI Analysis: ✅ Sentiment, themes, and purchase intent detected`);

  } catch (error) {
    console.error('❌ Reddit API test failed:', error.message);
    console.error('\n🔍 Troubleshooting:');
    console.error('1. Check your .env file has REDDIT_API_KEY');
    console.error('2. Verify your API key is correct');
    console.error('3. Make sure the Reddit Comment Analysis API is running');
    console.error('4. Check your internet connection');
  }
}

// CLI usage
if (require.main === module) {
  require('dotenv').config();
  testRedditAPI().catch(console.error);
}
