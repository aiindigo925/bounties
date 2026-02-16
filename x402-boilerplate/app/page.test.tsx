import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from './page'

// Mock fetch
global.fetch = jest.fn()

describe('x402 Boilerplate', () => {
  beforeEach(() => {
    ;(fetch as jest.Mock).mockClear()
  })

  it('renders the main interface', () => {
    render(<Home />)
    
    expect(screen.getByText('x402 Boilerplate')).toBeInTheDocument()
    expect(screen.getByText('Autonomous Agent Payment Standard')).toBeInTheDocument()
    expect(screen.getByText('Fetch Premium Data')).toBeInTheDocument()
    expect(screen.getByText('Response Buffer')).toBeInTheDocument()
    expect(screen.getByText('Execution Logs')).toBeInTheDocument()
  })

  it('shows initial state correctly', () => {
    render(<Home />)
    
    expect(screen.getByText('No data requested yet.')).toBeInTheDocument()
    expect(screen.getByText('Waiting for activity...')).toBeInTheDocument()
  })

  it('handles 402 payment required response', async () => {
    const mockResponse = {
      status: 402,
      json: () => Promise.resolve({
        type: '402',
        message: 'Payment required for premium content',
        challenge: {
          invoiceId: 'test-invoice-123',
          amount: '100000000000000000'
        }
      })
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
    
    render(<Home />)
    
    const fetchButton = screen.getByText('Fetch Premium Data')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('402 PAYMENT REQUIRED')).toBeInTheDocument()
      expect(screen.getByText('Payment required for premium content')).toBeInTheDocument()
      expect(screen.getByText('Authorize Payment')).toBeInTheDocument()
    })
    
    expect(screen.getByText(/Invoice: test-invoice-123/)).toBeInTheDocument()
    expect(screen.getByText(/Amount: 100000000000000000 wei/)).toBeInTheDocument()
  })

  it('handles successful data response', async () => {
    const mockResponse = {
      status: 200,
      json: () => Promise.resolve({
        premium: true,
        data: 'This is premium content',
        timestamp: Date.now()
      })
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
    
    render(<Home />)
    
    const fetchButton = screen.getByText('Fetch Premium Data')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText('SUCCESS')).toBeInTheDocument()
      expect(screen.getByText(/This is premium content/)).toBeInTheDocument()
    })
  })

  it('logs activity correctly', async () => {
    const mockResponse = {
      status: 200,
      json: () => Promise.resolve({ data: 'test' })
    }
    
    ;(fetch as jest.Mock).mockResolvedValueOnce(mockResponse)
    
    render(<Home />)
    
    const fetchButton = screen.getByText('Fetch Premium Data')
    fireEvent.click(fetchButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Calling GET \/api\/premium/)).toBeInTheDocument()
      expect(screen.getByText(/Success! Received premium data/)).toBeInTheDocument()
    })
  })
})