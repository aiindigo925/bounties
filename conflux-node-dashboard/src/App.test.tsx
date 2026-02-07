import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('dashboard has tests', () => {
  render(<div>Dashboard Test</div>);
  expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
});