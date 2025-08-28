# Model Insights Dashboard

This React application displays consumer conversations for the BMW R 12 G/S and provides AI‑powered insights and chat support.

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Clone the repository and install dependencies:
   ```bash
   git clone <repository_url>
   cd social-intelligence-dashboard
   npm install
   ```

## Data Generation

The dashboard uses a single data file in `src/data/r12gsConsumerData.js`.
Generate it from the markdown reports with:

```bash
npm run generate-r12gs-consumer-data
```

## Market Selection

Use the **Select Market** dropdown at the top of the dashboard to change the
active market. The list of markets comes from `r12gsConsumerData.js`.

## Vector Store & OpenAI Setup

Configure the application with your OpenAI key and vector store IDs in
`.env`. See
[OPENAI_API_SETUP.md](OPENAI_API_SETUP.md) and
[REPORT_VECTOR_STORE_SETUP.md](REPORT_VECTOR_STORE_SETUP.md) for detailed steps.

## Running the Dashboard

Start the development server and open `http://localhost:3000`:

```bash
npm start
```

## Using the AI Chatbot

Click the 🤖 button in the bottom‑right corner to open the chat panel.
The assistant answers questions about the selected market using the data
and uploaded PDF reports. See [AI_CHAT_SETUP.md](AI_CHAT_SETUP.md) for
details.

## Troubleshooting

1. If data is not displaying:
   - Run `npm run generate-r12gs-consumer-data`
   - Check console for errors
   - Verify markdown files are in the correct directory

2. If the dashboard fails to start:
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules: `rm -rf node_modules`
   - Reinstall dependencies: `npm install`

## Security

The application includes meta tags that prevent search engine indexing:

```html
<meta name="robots" content="noindex, nofollow" />
<meta http-equiv="X-Robots-Tag" content="noindex, nofollow" />
```

These tags keep the dashboard and its contents private.

## License

This project is proprietary and confidential. All rights reserved.
