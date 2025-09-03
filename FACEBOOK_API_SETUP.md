# Facebook Groups API Setup Guide

This guide will help you set up and configure the Facebook Groups API integration for your social intelligence dashboard.

## 🚀 Quick Start

### 1. Get Your Facebook API Key

You need an API key for the Facebook Groups Analysis API service. Contact your team admin or check your API service documentation for the correct key.

### 2. Configure Environment Variables

Add your Facebook API key to your `.env` file:

```env
FACEBOOK_API_KEY=your_facebook_api_key_here
```

### 3. Configure Facebook Groups

Edit the `config/facebook-groups.json` file to specify which Facebook groups to analyze:

```json
{
  "groups": [
    {
      "group_id": "1172760359503836",
      "name": "BMW Motorcycle Enthusiasts",
      "keywords": ["BMW", "motorcycle", "GS", "adventure", "touring"],
      "analysis_prompt": "Analyze discussions about BMW motorcycles, focusing on purchase intent, model preferences, and user experiences"
    }
  ]
}
```

### 4. Test the Integration

Run the Facebook API test:

```bash
npm run test-facebook
```

### 5. Run Data Collection

Once testing passes, run the weekly refresh:

```bash
npm run weekly-refresh-force
```

## 📋 Configuration Details

### Facebook Groups Configuration

The `config/facebook-groups.json` file contains:

- **groups**: Array of Facebook groups to analyze
  - `group_id`: The Facebook group ID (numeric string)
  - `name`: Display name for the group
  - `keywords`: Keywords to focus analysis on
  - `analysis_prompt`: Custom AI analysis prompt for this group

- **default_settings**: Default parameters for API calls
  - `number_of_posts`: Number of posts to analyze per group
  - `sorting_order`: How to sort posts (CHRONOLOGICAL, etc.)
  - `model`: AI model to use for analysis
  - `max_quote_length`: Maximum length for extracted quotes

- **analysis_prompts**: Predefined analysis prompts you can reference

### Environment Variables

Required:
- `FACEBOOK_API_KEY`: Your Facebook Groups API key

Optional:
- `FACEBOOK_GROUPS_CONFIG`: JSON string to override the config file (advanced)

## 🔧 API Endpoints

The Facebook Groups API uses these endpoints:

- **Health Check**: `GET /health` (no auth required)
- **Group Analysis**: `POST /analyze-facebook-group` (requires API key)

### Request Format

```json
{
  "group_id": "1172760359503836",
  "number_of_posts": 5,
  "sorting_order": "CHRONOLOGICAL",
  "ai_analysis_prompt": "Analyze discussions about motorcycles and purchase intent",
  "model": "gpt-5-mini-2025-08-07",
  "max_quote_length": 200
}
```

### Response Format

The API returns analyzed Facebook posts with:
- Sentiment analysis
- Theme classification
- Purchase intent detection
- Key quotes extraction
- Engagement metrics

## 🧪 Testing

### Test Facebook API Connection

```bash
npm run test-facebook
```

This will:
1. Check API key configuration
2. Test API connection
3. Load group configuration
4. Test single group analysis
5. Test full data collection

### Test Specific API Key

```bash
node scripts/test-api-key.js YOUR_API_KEY_HERE
```

## 📊 Data Integration

Facebook data is automatically integrated with your dashboard:

1. **Quote Explorer**: Facebook posts appear alongside Reddit posts
2. **AI Insights**: Facebook data contributes to purchase intent analysis
3. **Charts**: Facebook engagement metrics are included in visualizations

### Data Structure

Facebook posts are transformed to match the internal format:

```javascript
{
  id: "fb_groupid_postid",
  platform: "facebook",
  subreddit: "Group Name", // Using subreddit field for consistency
  title: "Post Title",
  author: "Author Name",
  content: "Post Content",
  ai_analysis: {
    sentiment: "positive|negative|neutral",
    themes: ["theme1", "theme2"],
    purchase_intent: "high|medium|low|none",
    key_quotes: ["quote1", "quote2"],
    summary: "AI-generated summary"
  },
  facebook_metadata: {
    group_id: "1172760359503836",
    group_name: "BMW Motorcycle Enthusiasts",
    post_id: "post_id",
    engagement_metrics: {}
  }
}
```

## 🔄 Weekly Refresh

Facebook data is automatically collected during weekly refresh:

```bash
# Manual refresh
npm run weekly-refresh-force

# Check refresh status
npm run weekly-refresh-status
```

## 🛠️ Troubleshooting

### Common Issues

1. **Invalid API Key**
   - Check your API key is correct
   - Verify the key hasn't expired
   - Contact your team admin

2. **Group Access Issues**
   - Ensure the group ID is correct
   - Check if the group is public or you have access
   - Verify the group exists

3. **Rate Limiting**
   - The system includes automatic rate limiting
   - Reduce `number_of_posts` if you hit limits
   - Add delays between group requests

4. **Network Issues**
   - Check your internet connection
   - Verify the API service is running
   - Check firewall settings

### Debug Commands

```bash
# Test API connection only
curl -X GET "https://facebookslapi-production.up.railway.app/health"

# Test with API key
curl -X GET "https://facebookslapi-production.up.railway.app/status" \
  -H "X-API-Key: YOUR_API_KEY"
```

## 📈 Adding More Groups

To add more Facebook groups:

1. Edit `config/facebook-groups.json`
2. Add new group objects to the `groups` array
3. Test with `npm run test-facebook`
4. Run weekly refresh to collect data

Example new group:

```json
{
  "group_id": "1234567890123456",
  "name": "Adventure Motorcycle Riders",
  "keywords": ["adventure", "motorcycle", "touring", "off-road"],
  "analysis_prompt": "Analyze discussions about adventure motorcycles, focusing on purchase intent and riding experiences"
}
```

## 🎯 Best Practices

1. **Start Small**: Begin with 2-3 groups and 5 posts each
2. **Monitor Performance**: Watch for rate limiting and adjust accordingly
3. **Custom Prompts**: Tailor analysis prompts to each group's focus
4. **Regular Updates**: Run weekly refresh consistently
5. **Backup Data**: The system automatically backs up previous data

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Run the test commands to diagnose problems
3. Check the logs in `logs/refresh.log`
4. Contact your team admin for API key issues

---

**Ready to start?** Run `npm run test-facebook` to test your setup! 🚀
