import { render, screen, fireEvent, act } from '@testing-library/react';
import QuoteExplorer from '../QuoteExplorer';
import { sampleQuotes } from '../../__fixtures__/quotes';

const baseFilters = {
  theme: 'All',
  sentiment: 'All',
  platform: 'All',
  week: 'All',
  purchaseIntent: 'All',
  competitor: 'All'
};

const baseProps = {
  filters: baseFilters,
  onFilterChange: jest.fn(),
  quotes: sampleQuotes,
  themes: ['Performance', 'Price'],
  sentiments: ['Positive', 'Negative'],
  platforms: ['forum', 'social'],
  weeks: ['1', '2'],
  purchaseIntents: ['Considering', 'Not Interested'],
  competitors: ['BrandX']
};

describe('QuoteExplorer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('filters quotes based on search input', () => {
    render(<QuoteExplorer {...baseProps} />);

    expect(screen.getByText(/Great bike/i)).toBeInTheDocument();
    expect(screen.getByText(/Too expensive/i)).toBeInTheDocument();

    const search = screen.getByLabelText(/search/i);
    fireEvent.change(search, { target: { value: 'expensive' } });

    act(() => {
      jest.runAllTimers();
    });

    expect(screen.queryByText(/Great bike/i)).toBeNull();
    expect(screen.getByText(/Too expensive/i)).toBeInTheDocument();
  });

  test('calls onFilterChange when a filter changes', () => {
    render(<QuoteExplorer {...baseProps} />);

    const themeSelect = screen.getByLabelText(/Theme/i);
    fireEvent.mouseDown(themeSelect);
    const option = screen.getByRole('option', { name: /Performance/i });
    fireEvent.click(option);

    expect(baseProps.onFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'Performance' })
    );
  });
});
