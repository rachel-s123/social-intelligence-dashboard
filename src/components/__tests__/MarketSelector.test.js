import { render, screen, fireEvent } from '@testing-library/react';
import MarketSelector from '../MarketSelector';
import { r12gsConsumerData } from '../../data/r12gsConsumerData';
import { getMarketDisplayName } from '../../utils/marketDisplayName';

describe('MarketSelector', () => {
    test('calls onMarketChange when selection changes', () => {
      const handleChange = jest.fn();
      const markets = Object.keys(r12gsConsumerData);
      const [initialMarket, nextMarket] = markets;

      render(
        <MarketSelector selectedMarket={initialMarket} onMarketChange={handleChange} />
      );

      const selectButton = screen.getByLabelText(/select market/i);
      fireEvent.mouseDown(selectButton);
      const option = screen.getByRole('option', {
        name: getMarketDisplayName(nextMarket),
      });
      fireEvent.click(option);

      expect(handleChange).toHaveBeenCalledWith(nextMarket);
    });
  });

