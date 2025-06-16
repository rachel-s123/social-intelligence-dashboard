// Core data structures used by components

// 1. WRI Data (used by AttributeHeatmap, MarketWRIScoreCards)
export const wriDataTemplate = {
  markets: [], // List of market names
  attributes: [], // List of attributes to analyze
  // Scores: { attribute: { market: score } }
  // Example:
  // scores: {
  //   'Performance': { 'UK': 88.5, 'France': 85.0 },
  //   'Range': { 'UK': 91.0, 'France': 87.5 },
  //   ...
  // }
  scores: {},
  deviations: {}, // Nested object: { attribute: { market: deviation } }
  topResonance: [
    {
      attribute: '', // Attribute name
      score: 0, // Resonance score
      reasoning: '', // Reasoning for high resonance
    }
  ],
  strategicDirection: {
    positioning: '', // Strategic positioning statement
    messaging: '', // Key messaging points
    opportunities: '', // Market opportunities
    considerations: '', // Key considerations
  }
};

// 2. Attribute Resonance (used by AttributeHeatmap, WRIStrategicDirection)
export const attributeResonanceTemplate = {
  [marketName]: {
    keyDrivers: {
      high: [
        {
          attribute: '', // Attribute name
          score: 0, // Driver score
          insight: '' // Driver insight
        }
      ],
      low: [
        {
          attribute: '', // Attribute name
          score: 0, // Driver score
          insight: '' // Driver insight
        }
      ]
    },
    resonanceFactors: {
      high: [], // List of high resonance factors
      low: [] // List of low resonance factors
    },
    marketInsights: [], // List of market-specific insights
    attributeAnalysis: {
      [attributeName]: {
        score: 0, // Attribute score
        rationale: '', // Reasoning for the score
        consumerInsight: '', // Consumer perspective
        insight: '', // Detailed insight
        recommendation: '' // Strategic recommendation
      }
    },
    strategicRecommendations: [
      {
        title: '', // Recommendation title
        details: '' // Detailed recommendation
      }
    ]
  }
};

// 3. Market Introduction (used by DashboardIntro)
export const marketIntroductionTemplate = {
  [marketName]: {
    title: '', // Market title
    introduction: '', // Market introduction text
    methodology: '', // Analysis methodology
    sources: [
      {
        name: '', // Source name
        type: '', // Source type (News, Review, Market Data, etc.)
        url: '', // Source URL
        description: '' // Source description
      }
    ]
  }
};

// 4. Conversation Data (used by MarketTrends)
export const conversationDataTemplate = {
  themeData: [
    { subject: '', value: 0 }, // Theme data points
  ],
  sentimentData: [
    { name: '', value: 0 }, // Sentiment data points
  ],
  insights: [], // List of market insights
  // Theme Insights: qualitative insights for each theme
  themeInsights: [
    {
      theme: '', // Theme name
      quote: '', // Supporting quote
      explanation: '', // Explanation of the insight
      source: '' // Source of the quote/insight
    }
  ],
  // Sentiment Insights: qualitative insights for each sentiment type
  sentimentInsights: [
    {
      sentiment: '', // Sentiment type (Positive, Neutral, Negative)
      quote: '', // Supporting quote
      explanation: '', // Explanation of the sentiment
      source: '' // Source of the quote/insight
    }
  ]
};

// 5. Competitor Data (used by ExecutiveSummary)
export const competitorDataTemplate = {
  shareOfVoice: [
    { name: '', value: 0 }, // Share of voice data
  ],
  // Competitors: each has strengths and weaknesses arrays
  competitors: {
    [competitorName]: {
      strengths: [], // List of strengths
      weaknesses: [] // List of weaknesses
    }
  },
  // Market Opportunities: list of opportunity cards
  marketOpportunities: [
    {
      title: '', // Opportunity title
      description: '' // Opportunity description
    }
  ]
};

// Helper function to validate data against the template
export const validateDataStructure = (data) => {
  const errors = [];
  
  // Validate market data structure
  if (!data.markets || !Array.isArray(data.markets)) {
    errors.push('Markets must be an array');
  }
  
  if (!data.attributes || !Array.isArray(data.attributes)) {
    errors.push('Attributes must be an array');
  }
  
  if (!data.scores || typeof data.scores !== 'object') {
    errors.push('Scores must be an object');
  }
  
  // Validate market insights structure
  if (!data.marketInsights || typeof data.marketInsights !== 'object') {
    errors.push('Market insights must be an object');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to create a new market entry
export const createMarketEntry = (marketName) => {
  return {
    sentiment: {
      overall: 0,
      trend: 'neutral',
      keyPoints: [],
    },
    topics: {
      primary: [],
      secondary: [],
      emerging: [],
    },
    attributesAnalysis: {},
    strategicRecommendations: {
      shortTerm: [],
      longTerm: [],
      priorities: [],
    },
    keyDrivers: {
      market: [],
      consumer: [],
      competitive: [],
    },
  };
};

// Helper function to create a new attribute analysis entry
export const createAttributeAnalysis = (attributeName, score = 0) => {
  return {
    score,
    insight: '',
    recommendation: '',
  };
};

// Helper function to parse market report markdown
export const parseMarketReport = (markdownContent) => {
  // Implementation will parse markdown into marketReportTemplate structure
  return {
    // Parsed data matching marketReportTemplate
  };
};

// Helper function to parse WRI report markdown
export const parseWRIReport = (markdownContent) => {
  // Implementation will parse markdown into wriReportTemplate structure
  return {
    // Parsed data matching wriReportTemplate
  };
};

// Helper function to validate market report data
export const validateMarketReport = (data) => {
  const errors = [];
  // Validation logic for market report data
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to validate WRI report data
export const validateWRIReport = (data) => {
  const errors = [];
  // Validation logic for WRI report data
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Helper function to update market data files
export const updateMarketData = (marketReportData) => {
  // Implementation will update:
  // - marketInsights.js
  // - marketIntroductions.js
  // - conversationData.js
  // - competitorData.js
  // - marketSources.js
};

// Helper function to update WRI data files
export const updateWRIData = (wriReportData) => {
  // Implementation will update:
  // - wriData.js
  // - wriInsights.js
};

// Example usage:
/*
1. Create a new market entry:
const newMarket = createMarketEntry('Market1');

2. Add attribute analysis:
newMarket.attributesAnalysis['Performance'] = createAttributeAnalysis('Performance', 85);

3. Validate the data:
const validation = validateDataStructure(data);
if (!validation.isValid) {
  console.error('Data validation errors:', validation.errors);
}
*/ 