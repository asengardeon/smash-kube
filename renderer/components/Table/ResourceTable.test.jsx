import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceTable } from './ResourceTable';

describe('ResourceTable Component', () => {
  const mockPods = [
    {
      metadata: { uid: '1', name: 'pod1', namespace: 'default', creationTimestamp: new Date().toISOString() },
      status: { phase: 'Running', containerStatuses: [{ restartCount: 0, state: { running: {} } }] }
    }
  ];

  test('renders "No resources found" when items are empty', () => {
    render(<ResourceTable view="pods" items={[]} />);
    expect(screen.getByText('Nenhum recurso encontrado.')).toBeInTheDocument();
  });

  test('renders pod list', () => {
    render(<ResourceTable view="pods" items={mockPods} />);
    expect(screen.getByText('pod1')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
  });

  test('calls onInspect when inspect button is clicked', () => {
    const onInspect = jest.fn();
    render(<ResourceTable view="pods" items={mockPods} onInspect={onInspect} />);
    
    // Actions are hidden by default (opacity-0 group-hover:opacity-100), 
    // but they are in the DOM.
    const inspectBtn = screen.getByTitle('Inspecionar JSON');
    fireEvent.click(inspectBtn);
    expect(onInspect).toHaveBeenCalledWith('Pod: pod1', mockPods[0]);
  });

  test('calls onDescribe when describe button is clicked', () => {
    const onDescribe = jest.fn();
    render(<ResourceTable view="pods" items={mockPods} onDescribe={onDescribe} />);
    
    const describeBtn = screen.getByTitle('Describe');
    fireEvent.click(describeBtn);
    expect(onDescribe).toHaveBeenCalledWith('pod', 'pod1', 'default');
  });

  test('calls onViewLogs when logs button is clicked', () => {
    const onViewLogs = jest.fn();
    render(<ResourceTable view="pods" items={mockPods} onViewLogs={onViewLogs} />);
    
    const logsBtn = screen.getByTitle('Logs');
    fireEvent.click(logsBtn);
    expect(onViewLogs).toHaveBeenCalledWith(mockPods[0]);
  });
});
