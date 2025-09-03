# Social Media API Integration Setup

This guide explains how to set up the new social media API data collection system for the BMW R 12 G/S Social Intelligence Dashboard.

## Overview

The dashboard now collects data directly from social media platforms instead of relying on manual research reports. This provides:

- **Real-time data**: Fresh consumer conversations updated weekly
- **Comprehensive coverage**: Multiple platforms (Reddit, YouTube, Facebook)
- **Automated analysis**: AI-powered sentiment and theme analysis
- **Scalable architecture**: Easy to add new platforms

## Architecture

```
Social Platforms → API Collectors → Data Processor → Dashboard
     ↓               ↓              ↓              ↓
  Raw Data      Filtered Data   Structured Data  Visualizations
```

### Components

1. **API Collectors** (`scripts/social-media-apis.js`)
   - Reddit API (no authentication required)
   - YouTube Data API v3
   - Facebook Graph API

2. **Data Processor** (`scripts/data-processor.js`)
   - Filters and cleans raw data
   - AI-powered sentiment analysis
   - Theme classification
   - Dashboard formatting

3. **Weekly Refresh** (`scripts/weekly-refresh.js`)
   - Automated data collection
   - Backup management
   - Error handling and logging

4. **API Endpoints**
   - `/api/refresh-data` - Trigger manual refresh
   - `/api/refresh-status` - Check refresh status

## Setup Instructions

### 1. Install Dependencies

The required dependencies are already in `package.json`. If you need to reinstall:

```bash
npm run reinstall
```

### 2. Configure API Keys

Copy the example configuration file:

```bash
cp config/social-apis.env.example .env
```

Edit `.env` with your API keys:

```env
# Required for AI analysis
OPENAI_API_KEY=your_openai_api_key_here

# Required for vector store
VS_REPORTS_STORE_ID=your_vector_store_id_here

# Optional - enhances data collection
YOUTUBE_API_KEY=your_youtube_api_key_here
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
```

### 3. Get API Keys

#### OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file

#### Reddit API Setup (Required for Reddit data)
Since you're using your existing Reddit Comment Analysis API, you just need to add your API key:

1. Get your API key from your Reddit Comment Analysis API service
2. Add it to your `.env` file:
   ```env
   REDDIT_API_KEY=your_reddit_api_key_here
   ```

**Note**: Your existing Reddit Comment Analysis API already handles:
- Reddit API authentication and rate limiting
- AI-powered sentiment analysis using GPT models
- Comment thread analysis and context
- Purchase intent detection
- Theme extraction

The system will use your existing API service instead of direct Reddit API calls.

#### YouTube Data API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Add it to your `.env` file

#### Facebook Access Token (Optional)
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Get an access token for Graph API
4. Add it to your `.env` file

### 4. Test the Setup

#### Test Reddit API Specifically
```bash
# Test Reddit API connection and functionality
npm run test-reddit

# This will:
# - Check if authentication credentials are configured
# - Test search functionality for R12GS content
# - Verify comment retrieval works
# - Show sample results
```

#### Test API Collection
```bash
# Collect data from all platforms
npm run collect-social-data

# Process collected data
npm run process-social-data data/raw/latest_raw_data.json
```

#### Test Weekly Refresh
```bash
# Check refresh status
npm run weekly-refresh-status

# Force a refresh (ignore schedule)
npm run weekly-refresh-force

# Normal scheduled refresh
npm run weekly-refresh
```

#### Test API Endpoints
```bash
# Start the server
npm run server

# Test refresh endpoint
curl -X POST http://localhost:3001/api/refresh-data

# Check refresh status
curl http://localhost:3001/api/refresh-status
```

## Usage

### Manual Data Refresh

You can trigger data collection manually through:

1. **Command Line**:
   ```bash
   npm run weekly-refresh-force
   ```

2. **API Endpoint**:
   ```javascript
   fetch('/api/refresh-data', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' }
   });
   ```

3. **Dashboard UI** (future enhancement)

### Automated Scheduling

For production deployment, set up a cron job:

```bash
# Weekly refresh every Monday at 2 AM
0 2 * * 1 /path/to/your/project/npm run weekly-refresh
```

Or use a service like GitHub Actions, Vercel Cron, or AWS Lambda.

### Monitoring

Check the logs and status:

```bash
# View refresh logs
tail -f logs/refresh.log

# Check refresh status
npm run weekly-refresh-status
```

## Data Structure

### Raw Data Format
```json
{
  "id": "reddit_post_abc123",
  "text": "BMW R 12 G/S looks amazing!",
  "author": "motorcycle_fan",
  "platform": "Reddit",
  "date": "2025-01-15",
  "url": "https://reddit.com/r/motorcycles/...",
  "engagement": 45,
  "type": "post"
}
```

### Processed Data Format
```json
{
  "market": "France",
  "sentimentAnalysis": { "positive": 65, "neutral": 20, "negative": 15 },
  "consumerReactionThemes": {
    "Heritage/Retro Styling Reactions": 35,
    "Price/Value Concerns": 25,
    // ... more themes
  },
  "consumerQuotes": [
    {
      "id": "quote_001",
      "text": "Love the retro design!",
      "sentiment": "POSITIVE",
      "theme": "Heritage/Retro Styling Reactions",
      "platform": "Reddit"
      // ... more fields
    }
  ],
  "keyInsights": {
    "Social Media Buzz": "Collected 1250 mentions across platforms",
    // ... more insights
  }
}
```

## Platform-Specific Notes

### Reddit
- **Authentication**: None required
- **Rate Limit**: 60 requests/minute
- **Coverage**: All public subreddits
- **Best for**: Detailed discussions and technical feedback

### YouTube
- **Authentication**: API key required
- **Rate Limit**: 100 requests/minute
- **Coverage**: Video comments and descriptions
- **Best for**: Video reviews and visual feedback

### Facebook
- **Authentication**: Access token required
- **Rate Limit**: 200 requests/minute
- **Coverage**: Public posts and comments
- **Best for**: Broad consumer sentiment

## Troubleshooting

### Common Issues

#### "OpenAI API key not found"
- Ensure `OPENAI_API_KEY` is set in `.env`
- Check that `.env` is in the project root
- Restart the server after adding the key

#### "Rate limit exceeded"
- The system automatically handles rate limits
- Wait a few minutes and try again
- Check `logs/refresh.log` for details

#### "No data collected"
- Verify API keys are correct
- Check internet connection
- Some platforms may have temporary issues

#### "Processing failed"
- Ensure OpenAI API key is configured
- Check that raw data files exist
- Look at error logs for details

### Debug Commands

```bash
# Test individual components
node scripts/social-media-apis.js --test
node scripts/data-processor.js --test

# Check data directories
ls -la data/raw/
ls -la data/processed/

# View recent logs
tail -20 logs/refresh.log
```

## Migration from Manual Reports

The new system maintains backward compatibility with the existing dashboard. Your current `r12gsConsumerData.js` will continue to work, but you can now update it with fresh API data.

### Gradual Migration

1. **Phase 1**: Run API collection alongside existing data
2. **Phase 2**: Compare results and fine-tune analysis
3. **Phase 3**: Switch to API data as primary source
4. **Phase 4**: Remove old manual report files

### Backup Strategy

The system automatically creates backups before each refresh:

- Located in `data/backups/`
- Keeps last 10 backups
- Can be restored manually if needed

## Future Enhancements

### Planned Features
- Twitter/X API integration
- Instagram API integration
- Real-time streaming data
- Advanced filtering and segmentation
- Predictive analytics
- Custom dashboard widgets

### Adding New Platforms

To add a new social platform:

1. Create a new API service class in `scripts/social-media-apis.js`
2. Add configuration in the `API_CONFIG` object
3. Implement data collection methods
4. Update the `SocialMediaDataCollector` class
5. Add platform-specific processing in `data-processor.js`

## Support

For issues or questions:
1. Check the logs in `logs/refresh.log`
2. Review the troubleshooting section above
3. Check API documentation for each platform
4. Ensure all environment variables are set correctly

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor API usage to avoid unexpected charges
- Keep backup files secure (they may contain user data)
