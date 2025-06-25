import { render, screen, fireEvent } from '@testing-library/react';
import MarketSelector from '../MarketSelector';

describe('MarketSelector', () => {
  test('calls onMarketChange when selection changes', () => {
    const handleChange = jest.fn();
    render(<MarketSelector selectedMarket="france" onMarketChange={handleChange} />);

    const selectButton = screen.getByLabelText(/select market/i);
    fireEvent.mouseDown(selectButton);
    const option = screen.getByRole('option', { name: /italy/i });
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith('italy');
  });
});
