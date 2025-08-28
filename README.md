# BMW Touring Segment Dashboard

This project contains a React dashboard that displays data generated from markdown reports, featuring interactive visualizations, competitor analysis, and PDF report viewing capabilities.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/rachel-s123/bmw_touring_segment_q1.git
   cd bmw_touring_segment_q1
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install additional required packages for PDF viewing:
   ```bash
   npm install react-pdf @react-pdf/renderer
   ```

## Report Structure

Place R 12 G/S consumer analysis markdown reports in:

- `reports/r12gs_consumer_analysis/` - R 12 G/S consumer analysis reports

When creating new R 12 G/S consumer analysis markdown files, copy `templates/model_insights_template.md`
into the `reports/r12gs_consumer_analysis/` directory and fill in the sections with your
market-specific insights.

## Data Generation

The dashboard requires several data files to be generated from the markdown reports. These files are located in `src/data/`:

- `wriData.js` - WRI data
- `wriInsights.js` - WRI insights
- `competitorData.js` - Competitor analysis data
- `conversationData.js` - Conversation data
- `executiveSummaries.js` - Executive summaries
- `marketRecommendations.js` - Market recommendations
- `marketIntroductions.js` - Market introductions
- `marketSources.js` - Market sources
 - `attributeResonance.js` - Attribute resonance data
 - `r12gsConsumerData.js` - R 12 G/S consumer conversation data

Generate these files by running the following scripts:
```bash
# Generate WRI data
npm run generate-wri-data

# Generate competitor analysis data
npm run generate-competitor-data

# Generate conversation data
npm run generate-conversation-data

# Generate executive summaries
npm run generate-executive-summaries

# Generate market recommendations
npm run generate-market-recommendations

# Generate market introductions
npm run generate-market-introductions

# Generate R 12 G/S consumer data
npm run generate-r12gs-consumer-data
```

## PDF Reports

Store R 12 G/S market PDFs in the `vector_reports/r12gs/` directory with the following naming convention:

```
vector_reports/r12gs/{country}-r12gs.pdf
```

Example: `vector_reports/r12gs/france-r12gs.pdf`

The PDF viewer supports:
- Continuous scrolling
- Fullscreen mode
- Zoom controls
- Page navigation

## Vector Store Setup

To enable AI search of the R 12 G/S PDF reports, upload the files in `vector_reports/r12gs/` to
a new OpenAI vector store:

```bash
node scripts/create_report_vector_store.js
```

Copy the printed ID and set it in your `.env` file as `R12GS_REPORTS_VECTOR_STORE_ID`.
See [REPORT_VECTOR_STORE_SETUP.md](REPORT_VECTOR_STORE_SETUP.md) for details.

## Running the Dashboard

1. Start the development server:
   ```bash
   npm start
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Dashboard Features

1. **Market Overview**
   - High-level summary of the market landscape
   - Key trends and market context
   - Introduction to the selected market

2. **Executive Summary**
   - Concise summary of findings for the selected market
   - Strategic implications for BMW's touring segment
   - Key takeaways and highlights

3. **Attribute Resonance**
   - Analysis of how product attributes resonate with consumers
   - Attribute scoring and importance
   - Visualizations of attribute performance

4. **Market Insights**
   - In-depth analysis of market dynamics and consumer behavior
   - Insights into market drivers and barriers
   - Data-driven findings for the selected market

5. **Competitor Analysis**
   - Share of Voice visualization (Q1 2025)
   - Strengths and weaknesses of major competitors
   - Market opportunities and gaps to exploit
   - Interactive charts and competitor breakdowns

6. **Recommendations**
   - Actionable recommendations for BMW's touring segment
   - Strategic suggestions based on data analysis
   - Market entry or product development guidance

## Troubleshooting

1. If PDFs are not loading:
   - Ensure PDF files are in the correct directory (`vector_reports/r12gs/`)
   - Check file naming convention
   - Verify PDF file permissions

2. If data is not displaying:
   - Run all data generation scripts
   - Check console for errors
   - Verify markdown files are in correct directories
   - Ensure all required data files exist in `src/data/`

3. If the dashboard fails to start:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `npm install`

## Contributing

1. Create a new branch for your changes
2. Make your modifications
3. Run all data generation scripts
4. Test the dashboard locally
5. Submit a pull request

## License

This project is proprietary and confidential. All rights reserved.

## Security

### Search Engine Indexing Prevention
The application is configured to prevent search engine indexing through meta tags in the HTML head. This ensures that the dashboard and its contents remain private and are not discoverable through search engines. The following meta tags are implemented:

```html
<meta name="robots" content="noindex, nofollow" />
<meta http-equiv="X-Robots-Tag" content="noindex, nofollow" />
```

These tags instruct search engines to:
- Not index the page content
- Not follow any links on the page
- Not cache the page

This security measure helps maintain the confidentiality of the dashboard and its data.
