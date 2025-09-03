// Social Media API Integration for R12GS Consumer Intelligence Dashboard
// This file handles data collection from various social media platforms

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// API Configuration
const API_CONFIG = {
  reddit: {
    baseUrl: 'https://www.reddit.com',
    userAgent: 'R12GS-Consumer-Analysis/1.0',
    rateLimitDelay: 1000, // 1 second between requests
    subreddits: ['motorcycles', 'bmwmotorrad', 'advrider', 'ducati', 'ktmduke', 'motorcycle']
  },
  facebook: {
    baseUrl: 'https://graph.facebook.com/v18.0',
    // Requires Facebook App and API token
    requiresAuth: true
  },
  youtube: {
    baseUrl: 'https://www.googleapis.com/youtube/v3',
    // Requires YouTube Data API key
    requiresAuth: true
  },
  instagram: {
    baseUrl: 'https://graph.instagram.com',
    // Requires Instagram Business Account and API token
    requiresAuth: true
  }
};

// Social Media API Service Class
class SocialMediaAPIService {
  constructor(platform, config) {
    this.platform = platform;
    this.config = config;
    this.lastRequestTime = 0;
  }

  async makeRequest(endpoint, params = {}) {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.rateLimitDelay) {
      await new Promise(resolve => setTimeout(resolve, this.config.rateLimitDelay - timeSinceLastRequest));
    }

    try {
      const headers = {
        'User-Agent': this.userAgent
      };

      // Add authentication if available
      if (this.accessToken && (!this.tokenExpiry || this.tokenExpiry > Date.now())) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      }

      const response = await axios.get(`${this.config.baseUrl}${endpoint}`, {
        params,
        headers
      });

      this.lastRequestTime = Date.now();
      return response.data;
    } catch (error) {
      console.error(`Error fetching from ${this.platform}:`, error.message);
      return null;
    }
  }

  // Test API connectivity
  async testConnection() {
    if (!this.apiKey) {
      throw new Error('REDDIT_API_KEY not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      console.log('✅ Reddit API: Connection test successful');
      return response.data;
    } catch (error) {
      console.error('❌ Reddit API: Connection test failed:', error.message);
      throw error;
    }
  }

  // Ensure API key is configured
  ensureAuthenticated() {
    if (!this.apiKey) {
      throw new Error('REDDIT_API_KEY not configured. Please add it to your .env file.');
    }
    return true;
  }
}

// Facebook Groups API Service
class FacebookAPIService extends SocialMediaAPIService {
  constructor() {
    super('facebook', API_CONFIG.facebook);

    // External API configuration
    this.baseUrl = 'https://facebookslapi-production.up.railway.app';
    this.apiKey = process.env.FACEBOOK_API_KEY;
    this.defaultModel = 'gpt-5-mini-2025-08-07';

    // Facebook Groups configuration
    this.groups = this.loadGroupConfiguration();
    this.analysisPrompts = this.loadAnalysisPrompts();

    // Check if API key is configured
    if (!this.apiKey) {
      console.warn('⚠️ FACEBOOK_API_KEY not found in environment variables');
      console.warn('Please add your Facebook Groups API key to .env');
    }
  }

  loadGroupConfiguration() {
    // Try to load from config file first
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, '..', 'config', 'facebook-groups.json');
      
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`📘 Loaded Facebook groups config from file: ${configData.groups.length} groups`);
        return configData.groups;
      }
    } catch (error) {
      console.warn('⚠️ Could not load Facebook groups config file:', error.message);
    }

    // Fallback to environment variable
    const groupsConfig = process.env.FACEBOOK_GROUPS_CONFIG;
    if (groupsConfig) {
      try {
        return JSON.parse(groupsConfig);
      } catch (error) {
        console.warn('⚠️ Invalid FACEBOOK_GROUPS_CONFIG JSON, using defaults');
      }
    }

    // Default configuration - can be overridden
    return [
      {
        group_id: "1172760359503836",
        name: "BMW Motorcycle Enthusiasts",
        keywords: ["BMW", "motorcycle", "GS", "adventure", "touring"],
        analysis_prompt: "Analyze discussions about BMW motorcycles, focusing on purchase intent, model preferences, and user experiences"
      }
    ];
  }

  loadAnalysisPrompts() {
    return {
      motorcycle_analysis: "Analyze discussions about motorcycles and purchase intent",
      bmw_specific: "Analyze discussions about BMW motorcycles, focusing on purchase intent, model preferences, and user experiences",
      general_vehicle: "Analyze discussions about vehicles, focusing on purchase intent and user preferences"
    };
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Facebook API health check failed: ${error.message}`);
    }
  }

  async analyzeGroup(groupConfig, numberOfPosts = 5) {
    if (!this.apiKey) {
      throw new Error('FACEBOOK_API_KEY not configured. Please add it to your .env file.');
    }

    try {
      const payload = {
        group_id: groupConfig.group_id,
        number_of_posts: numberOfPosts,
        sorting_order: "CHRONOLOGICAL",
        ai_analysis_prompt: groupConfig.analysis_prompt || this.analysisPrompts.motorcycle_analysis,
        model: this.defaultModel,
        max_quote_length: 200
      };

      const response = await axios.post(`${this.baseUrl}/analyze-facebook-group`, payload, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return this.transformGroupAnalysis(response.data, groupConfig);
    } catch (error) {
      console.error(`Error analyzing Facebook group ${groupConfig.group_id}:`, error.response?.data || error.message);
      throw error;
    }
  }

  transformGroupAnalysis(apiResponse, groupConfig) {
    // Transform Facebook API response to match our internal format
    const analyses = apiResponse.analyses || [];
    
    return analyses.map(analysis => ({
      id: `fb_${groupConfig.group_id}_${analysis.post_id || Date.now()}`,
      platform: 'facebook',
      subreddit: groupConfig.name, // Using group name as "subreddit" for consistency
      title: analysis.post_title || 'Facebook Group Discussion',
      author: analysis.author || 'Unknown',
      content: analysis.content || '',
      score: analysis.engagement_score || 0,
      created_utc: analysis.timestamp ? new Date(analysis.timestamp).getTime() / 1000 : Date.now() / 1000,
      url: analysis.post_url || '',
      permalink: analysis.post_url || '',
      num_comments: analysis.comment_count || 0,
      upvote_ratio: 1.0, // Facebook doesn't have upvote ratios
      is_self: true,
      selftext: analysis.content || '',
      link_flair_text: groupConfig.name,
      post_hint: 'facebook_post',
      preview: null,
      thumbnail: null,
      domain: 'facebook.com',
      is_video: false,
      media: null,
      is_gallery: false,
      gallery_data: null,
      // AI Analysis fields
      ai_analysis: {
        sentiment: analysis.sentiment || 'neutral',
        themes: analysis.themes || [],
        purchase_intent: this.mapPurchaseIntent(analysis.purchase_intent),
        key_quotes: analysis.key_quotes || [],
        summary: analysis.summary || '',
        confidence: analysis.confidence || 0.5
      },
      // Facebook specific fields
      facebook_metadata: {
        group_id: groupConfig.group_id,
        group_name: groupConfig.name,
        post_id: analysis.post_id,
        engagement_metrics: analysis.engagement_metrics || {}
      }
    }));
  }

  mapPurchaseIntent(externalIntent) {
    const intentMap = {
      'high': 'high',
      'medium': 'medium', 
      'low': 'low',
      'none': 'none',
      'very_high': 'high',
      'very_low': 'low'
    };
    return intentMap[externalIntent?.toLowerCase()] || 'none';
  }

  async collectAllGroupsData(numberOfPostsPerGroup = 5) {
    console.log(`📘 Collecting data from ${this.groups.length} Facebook groups...`);
    
    const allAnalyses = [];
    
    for (const group of this.groups) {
      try {
        console.log(`📘 Analyzing group: ${group.name} (${group.group_id})`);
        const groupData = await this.analyzeGroup(group, numberOfPostsPerGroup);
        allAnalyses.push(...groupData);
        
        // Rate limiting - be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Failed to analyze group ${group.name}:`, error.message);
        // Continue with other groups
      }
    }
    
    console.log(`📘 Collected ${allAnalyses.length} Facebook analyses`);
    return allAnalyses;
  }

  async searchFacebookContent(timeframe = 'month') {
    console.log('📘 Searching Facebook Groups for motorcycle content...');
    return await this.collectAllGroupsData();
  }
}

// Reddit API Service (using external Reddit Comment Analysis API)
class RedditAPIService extends SocialMediaAPIService {
  constructor() {
    super('reddit', API_CONFIG.reddit);

    // External API configuration
    this.baseUrl = 'https://redditslapi-production.up.railway.app';
    this.apiKey = process.env.REDDIT_API_KEY;
    this.defaultModel = 'gpt-4.1-2025-04-14';

    // Check if API key is configured
    if (!this.apiKey) {
      console.warn('⚠️ REDDIT_API_KEY not found in environment variables');
      console.warn('Please add your Reddit Comment Analysis API key to .env');
      console.warn('For now, the system will try to work with limited functionality');
    }
  }

  async searchPosts(query, timeframe = 'month', limit = 50) {
    if (!this.apiKey) {
      throw new Error('REDDIT_API_KEY not configured. Please add it to your .env file.');
    }

    console.log(`🔍 Reddit API: Searching for "${query}" (${timeframe}, limit: ${limit})`);

    try {
      const response = await axios.post(`${this.baseUrl}/analyze-search`, {
        query: query,
        sort: 'relevance',
        time: timeframe,
        limit: Math.min(limit, 50), // API recommends max 50
        nsfw: false,
        model: this.defaultModel,
        system_prompt: "You are an expert social media analyst specializing in BMW motorcycle consumer sentiment analysis. Focus on identifying sentiment, purchase intent, and key themes from Reddit discussions.",
        output_format: "json",
        max_quote_length: 500
      }, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 second timeout
      });

      console.log(`✅ Reddit API: Found ${response.data.comment_analyses?.length || 0} analyses`);

      // Transform the API response to our internal format
      return this.transformCommentAnalyses(response.data.comment_analyses || []);

    } catch (error) {
      console.error('❌ Reddit API search failed:', error.response?.data || error.message);
      throw error;
    }
  }

  // Transform external API response to internal format
  transformCommentAnalyses(analyses) {
    return analyses.map(analysis => ({
      id: analysis.post_id || `reddit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: analysis.quote || '',
      author: 'Reddit User', // API doesn't provide individual usernames for privacy
      platform: 'Reddit',
      date: analysis.date || new Date().toISOString().split('T')[0],
      url: analysis.post_url || '',
      engagement: 0, // API doesn't provide engagement metrics
      type: 'comment',
      // Pre-analyzed data from the external API
      sentiment: analysis.sentiment || 'NEUTRAL',
      theme: analysis.theme || 'General Discussion',
      purchaseIntent: this.mapPurchaseIntent(analysis.purchase_intent),
      confidence: analysis.confidence_score || 0,
      // Additional metadata
      threadDepth: analysis.thread_depth || 0,
      conversationQuality: analysis.conversation_quality || 0,
      childrenCount: analysis.children_count || 0
    }));
  }

  // Map external API purchase intent to our internal format
  mapPurchaseIntent(externalIntent) {
    const intentMap = {
      'high': 'YES',
      'completed': 'YES',
      'medium': 'CONDITIONAL',
      'low': 'CONDITIONAL',
      'none': 'NO',
      'negative': 'NO'
    };
    return intentMap[externalIntent] || 'UNKNOWN';
  }

  async searchR12GSContent(timeframe = 'month') {
    const query = '"R 12 G/S" OR "BMW R12GS" OR "R twelve G/S" OR "BMW R 12 GS"';
    console.log(`🔍 Reddit API: Searching for BMW R12GS content (${timeframe})`);

    const analyses = await this.searchPosts(query, timeframe);
    console.log(`✅ Reddit API: Retrieved ${analyses.length} comment analyses`);

    return analyses;
  }

  // Analyze specific subreddit for R12GS content
  async analyzeSubreddit(subreddit, timeframe = 'month', limit = 30) {
    if (!this.apiKey) {
      throw new Error('REDDIT_API_KEY not configured. Please add it to your .env file.');
    }

    console.log(`🔍 Reddit API: Analyzing r/${subreddit} for R12GS content (${timeframe}, limit: ${limit})`);

    try {
      const response = await axios.post(`${this.baseUrl}/analyze-subreddit`, {
        subreddit: subreddit,
        sort: 'hot',
        time: timeframe,
        limit: Math.min(limit, 50),
        model: this.defaultModel,
        system_prompt: "You are an expert social media analyst specializing in BMW motorcycle consumer sentiment analysis. Focus on identifying sentiment, purchase intent, and key themes from Reddit discussions about BMW R 12 G/S motorcycles.",
        output_format: "json",
        max_quote_length: 500
      }, {
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        timeout: 60000
      });

      console.log(`✅ Reddit API: Analyzed r/${subreddit} - ${response.data.comment_analyses?.length || 0} analyses`);
      return this.transformCommentAnalyses(response.data.comment_analyses || []);

    } catch (error) {
      console.error(`❌ Reddit API subreddit analysis failed for r/${subreddit}:`, error.response?.data || error.message);
      throw error;
    }
  }

  // Get data from multiple relevant subreddits
  async getMultiSubredditData(subreddits = ['motorcycles', 'bmwmotorrad', 'advrider'], timeframe = 'month') {
    const allContent = [];

    for (const subreddit of subreddits) {
      try {
        console.log(`📊 Analyzing subreddit: r/${subreddit}`);
        const content = await this.analyzeSubreddit(subreddit, timeframe, 20); // Smaller limit per subreddit
        allContent.push(...content);

        // Small delay to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`⚠️ Failed to analyze r/${subreddit}:`, error.message);
        // Continue with other subreddits
      }
    }

    console.log(`🎯 Total content from ${subreddits.length} subreddits: ${allContent.length}`);
    return allContent;
  }
}

// YouTube API Service
class YouTubeAPIService extends SocialMediaAPIService {
  constructor(apiKey) {
    super('youtube', API_CONFIG.youtube);
    this.apiKey = apiKey;
  }

  async searchVideos(query, maxResults = 50) {
    const endpoint = '/search';
    const params = {
      key: this.apiKey,
      q: query,
      part: 'snippet',
      type: 'video',
      maxResults: maxResults,
      order: 'relevance',
      publishedAfter: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
    };

    const data = await this.makeRequest(endpoint, params);
    if (!data) return [];

    return data.items.map(video => ({
      id: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
      platform: 'YouTube'
    }));
  }

  async getVideoComments(videoId) {
    const endpoint = '/commentThreads';
    const params = {
      key: this.apiKey,
      part: 'snippet',
      videoId: videoId,
      maxResults: 100,
      order: 'relevance'
    };

    const data = await this.makeRequest(endpoint, params);
    if (!data) return [];

    return data.items.map(comment => ({
      id: comment.id,
      text: comment.snippet.topLevelComment.snippet.textDisplay,
      author: comment.snippet.topLevelComment.snippet.authorDisplayName,
      publishedAt: comment.snippet.topLevelComment.snippet.publishedAt,
      likeCount: comment.snippet.topLevelComment.snippet.likeCount,
      platform: 'YouTube',
      videoId: videoId
    }));
  }

  async searchR12GSContent() {
    const query = '"BMW R 12 G/S" OR "R twelve G/S" OR "BMW R12GS"';
    const videos = await this.searchVideos(query);

    const allContent = [];

    for (const video of videos.slice(0, 10)) { // Limit to first 10 videos
      allContent.push({
        id: `youtube_video_${video.id}`,
        text: `${video.title} ${video.description}`,
        author: video.channelTitle,
        platform: 'YouTube',
        date: video.publishedAt.split('T')[0],
        url: video.url,
        type: 'video'
      });

      // Get comments for this video
      const comments = await this.getVideoComments(video.id);
      for (const comment of comments.slice(0, 20)) { // Limit comments
        if (comment.text && comment.text.length > 20) {
          allContent.push({
            id: `youtube_comment_${comment.id}`,
            text: comment.text,
            author: comment.author,
            platform: 'YouTube',
            date: comment.publishedAt.split('T')[0],
            url: video.url,
            engagement: comment.likeCount || 0,
            type: 'comment'
          });
        }
      }
    }

    return allContent;
  }
}

// Facebook API Service (requires authentication)
class FacebookAPIService extends SocialMediaAPIService {
  constructor(accessToken) {
    super('facebook', API_CONFIG.facebook);
    this.accessToken = accessToken;
  }

  async makeRequest(endpoint, params = {}) {
    params.access_token = this.accessToken;
    return super.makeRequest(endpoint, params);
  }

  async searchPosts(query, limit = 100) {
    // Note: Facebook Graph API search is limited and may require specific permissions
    const endpoint = '/search';
    const params = {
      q: query,
      type: 'post',
      limit: limit,
      fields: 'id,message,created_time,from,permalink_url,comments.summary(true),likes.summary(true)'
    };

    const data = await this.makeRequest(endpoint, params);
    if (!data) return [];

    return data.data.map(post => ({
      id: post.id,
      text: post.message || '',
      author: post.from?.name || 'Unknown',
      created_time: post.created_time,
      permalink_url: post.permalink_url,
      comments_count: post.comments?.summary?.total_count || 0,
      likes_count: post.likes?.summary?.total_count || 0,
      platform: 'Facebook'
    }));
  }

  async searchR12GSContent() {
    const query = 'BMW R 12 G/S OR R12GS';
    const posts = await this.searchPosts(query);

    return posts.map(post => ({
      id: `facebook_post_${post.id}`,
      text: post.text,
      author: post.author,
      platform: 'Facebook',
      date: post.created_time.split('T')[0],
      url: post.permalink_url,
      engagement: post.likes_count + post.comments_count,
      type: 'post'
    }));
  }
}

// Main Social Media Data Collector
class SocialMediaDataCollector {
  constructor() {
    this.services = {};
    this.initializeServices();
  }

  initializeServices() {
    // Initialize Reddit (no auth required)
    this.services.reddit = new RedditAPIService();

    // Initialize YouTube (requires API key)
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      this.services.youtube = new YouTubeAPIService(youtubeApiKey);
    }

    // Initialize Facebook (requires access token)
    const facebookToken = process.env.FACEBOOK_ACCESS_TOKEN;
    if (facebookToken) {
      this.services.facebook = new FacebookAPIService(facebookToken);
    }
  }

  async collectAllData(market = 'global') {
    console.log(`🔍 Starting data collection for market: ${market}`);

    const allContent = [];
    const collectionPromises = [];

    // Collect from all available services
    for (const [platform, service] of Object.entries(this.services)) {
      console.log(`📊 Collecting data from ${platform}...`);

      const promise = service.searchR12GSContent()
        .then(content => {
          console.log(`✅ Collected ${content.length} items from ${platform}`);
          allContent.push(...content);
          return content;
        })
        .catch(error => {
          console.error(`❌ Error collecting from ${platform}:`, error.message);
          return [];
        });

      collectionPromises.push(promise);
    }

    await Promise.all(collectionPromises);

    console.log(`🎯 Total content collected: ${allContent.length}`);

    // Save raw data
    this.saveRawData(allContent, market);

    return allContent;
  }

  saveRawData(data, market) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `raw_social_data_${market}_${timestamp}.json`;
    const filepath = path.join(__dirname, '../data/raw', filename);

    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    console.log(`💾 Raw data saved to: ${filepath}`);
  }

  async collectAndProcess(market = 'global') {
    const rawData = await this.collectAllData(market);
    const processedData = await this.processData(rawData, market);

    return processedData;
  }

  async processData(rawData, market) {
    // Import the existing data processor
    const { processSocialData } = require('./data-processor');

    return processSocialData(rawData, market);
  }
}

// Export for use in other scripts
module.exports = {
  SocialMediaDataCollector,
  RedditAPIService,
  YouTubeAPIService,
  FacebookAPIService
};

// CLI usage
if (require.main === module) {
  const collector = new SocialMediaDataCollector();

  // Get market from command line args or default to 'global'
  const market = process.argv[2] || 'global';

  collector.collectAndProcess(market)
    .then(() => {
      console.log('✅ Data collection and processing complete!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Data collection failed:', error);
      process.exit(1);
    });
}
