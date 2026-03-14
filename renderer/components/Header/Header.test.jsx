import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from './Header';

describe('Header Component', () => {
  const mockProps = {
    currentView: 'pods',
    activeCluster: { name: 'cluster1' },
    searchTerm: '',
    setSearchTerm: jest.fn(),
    selectedNamespace: 'all',
    setSelectedNamespace: jest.fn(),
    namespaces: [{ metadata: { name: 'ns1' } }],
    onReconnect: jest.fn(),
    onRefresh: jest.fn(),
    loading: false
  };

  test('renders current view name', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('pods')).toBeInTheDocument();
  });

  test('renders search input when cluster is active', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByPlaceholderText('Buscar recursos...')).toBeInTheDocument();
  });

  test('calls setSearchTerm when input changes', () => {
    render(<Header {...mockProps} />);
    const input = screen.getByPlaceholderText('Buscar recursos...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('test');
  });

  test('renders namespace selector', () => {
    render(<Header {...mockProps} />);
    expect(screen.getByText('Todos os Namespaces')).toBeInTheDocument();
    expect(screen.getByText('ns1')).toBeInTheDocument();
  });

  test('calls onRefresh when refresh button is clicked', () => {
    render(<Header {...mockProps} />);
    // The refresh button doesn't have text, but it has a title attribute? 
    // Looking at Header.jsx: it doesn't have a title, only a class and disabled prop.
    // Let's find it by getting the buttons and picking the last one.
    const buttons = screen.getAllByRole('button');
    const refreshBtn = buttons[buttons.length - 1]; 
    fireEvent.click(refreshBtn);
    expect(mockProps.onRefresh).toHaveBeenCalled();
  });
});
