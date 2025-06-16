const fs = require('fs');
const path = require('path');

// Directories
const reportsDir = path.join(__dirname, '../reports/market_overviews');
const outputDir = path.join(__dirname, '../src/data');

// Helper: Parse market overview markdown
function parseMarketMarkdown(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf8');
  const sections = content.split('---');
  
  // Parse the main content section
  const mainContent = sections[0];
  const dataSources = sections[1];

  // Extract sections using regex
  const titleMatch = mainContent.match(/# Market Overview: (.*)/);
  const dashboardScopeMatch = mainContent.match(/### Dashboard Scope\n([\s\S]*?)(?=###|$)/);
  const strategicApplicationsMatch = mainContent.match(/### Strategic Applications\n([\s\S]*?)(?=###|$)/);
  const dashboardSectionsMatch = mainContent.match(/## Dashboard Sections\n([\s\S]*?)(?=##|$)/);
  const methodologyMatch = mainContent.match(/## Methodology\n([\s\S]*?)(?=##|$)/);

  // Parse dashboard sections
  const sectionsList = dashboardSectionsMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => {
      const match = line.match(/\*\*(.*?)\*\*\s*(.*)/);
      return {
        title: match[1].trim(),
        description: match[2].trim()
      };
    });

  // Parse methodology
  const methodologyList = methodologyMatch[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => {
      const match = line.match(/\*\*(.*?)\*\*\s*(.*)/);
      return {
        title: match[1].trim(),
        description: match[2].trim()
      };
    });

  // Parse data sources (flat list, no section headers)
  const sources = [];
  if (dataSources) {
    dataSources.split('\n').forEach(line => {
      // Accept both '- [Source]: Description' and '- Source: Description'
      let match = line.match(/^- \[(.*?)\]: (.*)/);
      if (!match) {
        match = line.match(/^- ([^\[][^:]*): (.*)/);
      }
      if (match) {
        const name = match[1].trim();
        const description = match[2].trim();
        // Determine source type based on description (optional, can default to 'Other')
        let type = 'Other';
        if (description.toLowerCase().includes('news') || description.toLowerCase().includes('coverage')) {
          type = 'News';
        } else if (description.toLowerCase().includes('review') || description.toLowerCase().includes('analysis')) {
          type = 'Review';
        } else if (description.toLowerCase().includes('forum') || description.toLowerCase().includes('community')) {
          type = 'Forum';
        } else if (description.toLowerCase().includes('social') || description.toLowerCase().includes('facebook') || description.toLowerCase().includes('twitter')) {
          type = 'Social Media';
        } else if (description.toLowerCase().includes('official') || description.toLowerCase().includes('announcement')) {
          type = 'Press Release';
        } else if (description.toLowerCase().includes('specification') || description.toLowerCase().includes('technical')) {
          type = 'Product Information';
        }
        sources.push({ name, description, type });
      }
    });
  }

  return {
    title: titleMatch[1].trim(),
    dashboardScope: dashboardScopeMatch[1].trim(),
    strategicApplications: strategicApplicationsMatch[1].trim(),
    sections: sectionsList,
    methodology: methodologyList,
    sources: { "": sources }
  };
}

// Main function to process all market overviews
function processMarketOverviews() {
  // Ensure the reports directory exists
  if (!fs.existsSync(reportsDir)) {
    console.log('Creating market_overviews directory...');
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md'));
  const marketData = {};
  
  files.forEach(file => {
    const mdPath = path.join(reportsDir, file);
    const parsedData = parseMarketMarkdown(mdPath);
    const marketKey = parsedData.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    marketData[marketKey] = {
      title: parsedData.title,
      introduction: `${parsedData.dashboardScope}\n\n${parsedData.strategicApplications}`,
      methodology: `This dashboard combines two complementary analytical approaches:\n\n${
        parsedData.methodology.map(m => `1. ${m.title}:\n   - ${m.description}`).join('\n\n')
      }`,
      sources: parsedData.sources
    };
  });
  
  return marketData;
}

// Generate output files
function generateOutputFiles(marketData) {
  // Generate marketIntroductions.js
  const introContent = `// Generated market introduction data
export const marketIntroductions = ${JSON.stringify(marketData, null, 2)};

export const getMarketIntroduction = (market) => {
  return marketIntroductions[market?.toLowerCase()] || null;
};
`;
  fs.writeFileSync(path.join(outputDir, 'marketIntroductions.js'), introContent);
  
  // Generate marketSources.js
  const sourcesData = {};
  Object.keys(marketData).forEach(marketKey => {
    // Flatten all sources into a single array
    const allSources = [];
    Object.values(marketData[marketKey].sources).forEach(sources => {
      if (Array.isArray(sources)) {
        allSources.push(...sources);
      }
    });
    sourcesData[marketKey] = { sources: { "": allSources } };
  });
  const sourcesContent = `// Generated market sources data
export const marketSources = ${JSON.stringify(sourcesData, null, 2)};
`;
  fs.writeFileSync(path.join(outputDir, 'marketSources.js'), sourcesContent);
  
  console.log('Generated market introduction and sources data in', outputDir);
}

// Main execution
function main() {
  console.log('Processing market overview reports...');
  const marketData = processMarketOverviews();
  generateOutputFiles(marketData);
}

main(); 