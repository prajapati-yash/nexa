// Test file to verify Marketplace component
import React from 'react';
import { render } from '@testing-library/react';
import Marketplace from '@/Components/Marketplace/Marketplace';

// Mock the hooks to avoid blockchain calls during testing
jest.mock('@/hooks/useContractData', () => ({
  useContractData: () => ({
    assets: [],
    loading: false,
    error: null,
    refreshData: jest.fn()
  }),
  useWallet: () => ({
    connected: false,
    connectWallet: jest.fn()
  }),
  useBusinessActions: () => ({
    investInBusiness: jest.fn()
  })
}));

describe('Marketplace Component', () => {
  it('renders without crashing', () => {
    const { getByText } = render(<Marketplace />);
    expect(getByText('Investment Marketplace')).toBeInTheDocument();
  });

  it('shows blockchain data toggle', () => {
    const { getByText } = render(<Marketplace />);
    expect(getByText('Blockchain Data (0)')).toBeInTheDocument();
    expect(getByText('Demo Data (3)')).toBeInTheDocument();
  });
});
