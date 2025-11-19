import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('should render without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
    expect(container).toBeInTheDocument();
  });
});
