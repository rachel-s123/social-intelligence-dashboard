// Test Facebook Groups API Integration
// This script tests the Facebook Groups API connection and data collection

const { FacebookAPIService } = require('./social-media-apis');
require('dotenv').config();

async function testFacebookAPI() {
  console.log('📘 Testing Facebook Groups API Integration...\n');

  // Initialize Facebook API service
  const facebook = new FacebookAPIService();

  // Test 1: Check API key configuration
  console.log('1️⃣ Checking API key configuration...');
  if (!facebook.apiKey) {
    console.log('❌ FACEBOOK_API_KEY not found in environment variables');
    console.log('Please add your Facebook Groups API key to .env file:');
    console.log('FACEBOOK_API_KEY=your_api_key_here');
    return;
  }
  console.log('✅ API key configured');

  // Test 2: Test API connection
  console.log('\n2️⃣ Testing API connection...');
  try {
    const healthData = await facebook.testConnection();
    console.log('✅ Facebook API connection successful');
    console.log('📊 API Status:', healthData);
  } catch (error) {
    console.log('❌ Facebook API connection failed:', error.message);
    return;
  }

  // Test 3: Test group configuration loading
  console.log('\n3️⃣ Testing group configuration...');
  console.log(`📘 Loaded ${facebook.groups.length} Facebook groups:`);
  facebook.groups.forEach((group, index) => {
    console.log(`   ${index + 1}. ${group.name} (ID: ${group.group_id})`);
    console.log(`      Keywords: ${group.keywords.join(', ')}`);
  });

  // Test 4: Test single group analysis
  console.log('\n4️⃣ Testing single group analysis...');
  try {
    const firstGroup = facebook.groups[0];
    console.log(`📘 Analyzing group: ${firstGroup.name}`);
    
    const groupData = await facebook.analyzeGroup(firstGroup, 2); // Small test with 2 posts
    console.log(`✅ Successfully analyzed ${groupData.length} posts from ${firstGroup.name}`);
    
    if (groupData.length > 0) {
      const sample = groupData[0];
      console.log('📊 Sample analysis:');
      console.log(`   Title: ${sample.title}`);
      console.log(`   Author: ${sample.author}`);
      console.log(`   Sentiment: ${sample.ai_analysis.sentiment}`);
      console.log(`   Purchase Intent: ${sample.ai_analysis.purchase_intent}`);
      console.log(`   Themes: ${sample.ai_analysis.themes.join(', ')}`);
    }
  } catch (error) {
    console.log('❌ Group analysis failed:', error.message);
    console.log('This might be due to:');
    console.log('- Invalid API key');
    console.log('- Group ID not accessible');
    console.log('- API rate limiting');
    console.log('- Network issues');
  }

  // Test 5: Test full data collection
  console.log('\n5️⃣ Testing full data collection...');
  try {
    console.log('📘 Collecting data from all configured groups...');
    const allData = await facebook.collectAllGroupsData(2); // Small test with 2 posts per group
    console.log(`✅ Successfully collected ${allData.length} total analyses`);
    
    // Show summary by group
    const groupSummary = {};
    allData.forEach(item => {
      const groupName = item.subreddit; // Using subreddit field for group name
      if (!groupSummary[groupName]) {
        groupSummary[groupName] = 0;
      }
      groupSummary[groupName]++;
    });
    
    console.log('📊 Data summary by group:');
    Object.entries(groupSummary).forEach(([group, count]) => {
      console.log(`   ${group}: ${count} analyses`);
    });
    
  } catch (error) {
    console.log('❌ Full data collection failed:', error.message);
  }

  console.log('\n🎯 Facebook API Test Complete!');
  console.log('\nNext steps:');
  console.log('1. If tests passed, run: npm run weekly-refresh-force');
  console.log('2. Check your dashboard for new Facebook data');
  console.log('3. Add more groups to config/facebook-groups.json if needed');
}

// CLI usage
if (require.main === module) {
  testFacebookAPI().catch(console.error);
}
