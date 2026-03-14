import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from './Sidebar';

describe('Sidebar Component', () => {
  const mockClusters = [
    { id: '1', name: 'Cluster A', region: 'us-east-1', profile: 'default' }
  ];
  const mockProps = {
    clusters: mockClusters,
    activeCluster: null,
    selectCluster: jest.fn(),
    onAddCluster: jest.fn(),
    onEditCluster: jest.fn(),
    onDeleteCluster: jest.fn(),
    onShowHelp: jest.fn(),
    currentView: 'pods',
    setCurrentView: jest.fn()
  };

  test('renders app title', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Smash Kube')).toBeInTheDocument();
  });

  test('renders cluster list', () => {
    render(<Sidebar {...mockProps} />);
    expect(screen.getByText('Cluster A')).toBeInTheDocument();
  });

  test('calls selectCluster when a cluster is clicked', () => {
    render(<Sidebar {...mockProps} />);
    fireEvent.click(screen.getByText('Cluster A'));
    expect(mockProps.selectCluster).toHaveBeenCalledWith(mockClusters[0]);
  });

  test('calls onAddCluster when plus button is clicked', () => {
    render(<Sidebar {...mockProps} />);
    const addBtn = screen.getByTitle('Ajuda e Atalhos').nextSibling; // The Plus button is next to Help button
    // Alternatively, find by svg or just the container
    fireEvent.click(screen.getAllByRole('button')[1]); // 0 is help, 1 is plus
    expect(mockProps.onAddCluster).toHaveBeenCalled();
  });

  test('shows workload items when cluster is active', () => {
    render(<Sidebar {...mockProps} activeCluster={mockClusters[0]} />);
    expect(screen.getByText('Pods')).toBeInTheDocument();
    expect(screen.getByText('Deployments')).toBeInTheDocument();
  });
});
