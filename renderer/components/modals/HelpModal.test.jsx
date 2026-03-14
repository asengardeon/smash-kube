import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpModal } from './HelpModal';

describe('HelpModal Component', () => {
  test('does not render when isOpen is false', () => {
    const { container } = render(<HelpModal isOpen={false} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renders help content when isOpen is true', () => {
    render(<HelpModal isOpen={true} onClose={jest.fn()} />);
    expect(screen.getByText('Ajuda e Dicas')).toBeInTheDocument();
    expect(screen.getByText('Como começar')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(<HelpModal isOpen={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Fechar'));
    expect(onClose).toHaveBeenCalled();
  });
});
