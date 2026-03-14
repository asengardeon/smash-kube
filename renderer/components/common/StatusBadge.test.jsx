import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders correctly with Running status', () => {
    render(<StatusBadge status="Running" />);
    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText('Running')).toHaveClass('text-green-400');
  });

  it('renders correctly with Failed status', () => {
    render(<StatusBadge status="Failed" reason="CrashLoopBackOff" />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toHaveClass('text-red-400');
    expect(screen.getByText('CrashLoopBackOff')).toBeInTheDocument();
  });

  it('renders correctly with Pending status', () => {
    render(<StatusBadge status="Pending" />);
    expect(screen.getByText('Pending')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toHaveClass('text-yellow-400');
  });
});
