import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HomePage from '../app/page';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  process.env = { 
    ...originalEnv, 
    X402_SECRET: 'test-secret',
    STRIPE_SECRET_KEY: 'sk_test_123'
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe('X402 Boilerplate Integration Tests', () => {
  it('renders homepage without authentication', () => {
    render(<HomePage />);
    
    expect(screen.getByText('X402 Premium Content')).toBeInTheDocument();
    expect(screen.getByText('Premium features locked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /unlock premium/i })).toBeInTheDocument();
  });

  it('displays loading state during payment verification', async () => {
    mockFetch.mockImplementationOnce(() => 
      new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ valid: true, content: 'Premium content unlocked!' })
      }), 100))
    );

    render(<HomePage />);
    
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);
    
    expect(screen.getByText(/verifying payment/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Premium content unlocked!')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles payment verification failure gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<HomePage />);
    
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);
    
    await waitFor(() => {
      expect(screen.getByText(/payment verification failed/i)).toBeInTheDocument();
    });
  });

  it('shows premium content when payment is verified', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ 
        valid: true, 
        content: 'Exclusive premium features',
        features: ['Advanced Analytics', 'Priority Support', 'Custom Themes']
      })
    });

    render(<HomePage />);
    
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);
    
    await waitFor(() => {
      expect(screen.getByText('Exclusive premium features')).toBeInTheDocument();
      expect(screen.getByText('Advanced Analytics')).toBeInTheDocument();
      expect(screen.getByText('Priority Support')).toBeInTheDocument();
      expect(screen.getByText('Custom Themes')).toBeInTheDocument();
    });
  });

  it('validates X402 payment headers correctly', async () => {
    const mockPaymentHeaders = {
      'X402-Payment-Hash': 'abc123',
      'X402-Payment-Signature': 'def456',
      'X402-Amount': '1000'
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ valid: true })
    });

    render(<HomePage />);
    
    // Simulate payment flow with headers
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/verify',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: expect.stringContaining('payment')
        })
      );
    });
  });

  it('handles invalid X402 payments', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 402,
      json: () => Promise.resolve({ 
        error: 'Payment Required',
        details: 'Invalid payment signature' 
      })
    });

    render(<HomePage />);
    
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);
    
    await waitFor(() => {
      expect(screen.getByText(/invalid payment/i)).toBeInTheDocument();
    });
  });

  it('persists payment state across page reloads', async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({ 
        paymentVerified: true, 
        expires: Date.now() + 3600000 
      })),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    render(<HomePage />);
    
    // Should show premium content immediately due to cached payment
    await waitFor(() => {
      expect(screen.queryByText('Premium features locked')).not.toBeInTheDocument();
    });
  });

  it('expires cached payment after timeout', () => {
    const localStorageMock = {
      getItem: jest.fn(() => JSON.stringify({ 
        paymentVerified: true, 
        expires: Date.now() - 1000 // Expired 1 second ago
      })),
      setItem: jest.fn(),
      removeItem: jest.fn()
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });

    render(<HomePage />);
    
    // Should show locked content due to expired payment
    expect(screen.getByText('Premium features locked')).toBeInTheDocument();
  });

  it('displays correct payment amount and currency', () => {
    render(<HomePage />);
    
    // Check if payment amount is displayed (adjust based on your implementation)
    expect(screen.getByText(/\$0\.01/)).toBeInTheDocument(); // or whatever your price is
  });

  it('handles network connectivity issues', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<HomePage />);
    
    const unlockButton = screen.getByRole('button', { name: /unlock premium/i });
    fireEvent.click(unlockButton);
    
    await waitFor(() => {
      expect(screen.getByText(/network error|connection failed/i)).toBeInTheDocument();
    });
  });
});