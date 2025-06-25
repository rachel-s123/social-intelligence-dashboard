import { render } from '@testing-library/react';
import ThemeCharts from '../ThemeCharts';
import PlatformAnalysis from '../PlatformAnalysis';
import PurchaseIntentFunnel from '../PurchaseIntentFunnel';
import CompetitiveIntelCharts from '../CompetitiveIntelCharts';
import SentimentTimeline from '../SentimentTimeline';
import { themeData, platformData, purchaseIntentData, competitorData, timelineData } from '../../__fixtures__/chartData';

describe('Chart components responsiveness', () => {
  const cases = [
    { Comp: ThemeCharts, data: themeData },
    { Comp: PlatformAnalysis, data: platformData },
    { Comp: PurchaseIntentFunnel, data: purchaseIntentData },
    { Comp: CompetitiveIntelCharts, data: competitorData },
    { Comp: SentimentTimeline, data: timelineData }
  ];

  cases.forEach(({ Comp, data }) => {
    test(`${Comp.name} renders inside ResponsiveContainer`, () => {
      const { container } = render(<Comp data={data} />);
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument();
    });
  });
});
