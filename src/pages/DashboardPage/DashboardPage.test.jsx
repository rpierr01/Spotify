import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';

describe('DashboardPage', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    );
  });
});
