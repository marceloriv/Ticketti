import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryCard from '../../../src/components/common/CategoryCard';

const defaultProps = {
  title: 'Conciertos',
  imgSrc: '/img/conciertos.jpg',
  description: 'Los mejores shows en vivo',
  onClick: vi.fn(),
};

const renderCard = (props = {}) => {
  const merged = { ...defaultProps, ...props };
  return render(<CategoryCard {...merged} />);
};

describe('CategoryCard', () => {
  it('renderiza título e imagen', () => {
    renderCard();
    expect(screen.getByText('Conciertos')).toBeInTheDocument();
    expect(screen.getByAltText('Conciertos')).toHaveAttribute('src', '/img/conciertos.jpg');
  });

  it('renderiza descripción cuando se proporciona', () => {
    renderCard();
    expect(screen.getByText('Los mejores shows en vivo')).toBeInTheDocument();
  });

  it('no renderiza descripción cuando no se proporciona', () => {
    renderCard({ description: undefined });
    expect(screen.queryByText('Los mejores shows en vivo')).not.toBeInTheDocument();
  });

  it('ejecuta onClick al hacer click en la tarjeta', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderCard({ onClick });
    await user.click(screen.getByText('Conciertos'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ejecuta onClick con teclado Enter', () => {
    const onClick = vi.fn();
    renderCard({ onClick });
    const card = screen.getByRole('button', { name: /Explorar categoría/i });
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('ejecuta onClick con teclado Space', () => {
    const onClick = vi.fn();
    renderCard({ onClick });
    const card = screen.getByRole('button', { name: /Explorar categoría/i });
    fireEvent.keyDown(card, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('tiene atributos de accesibilidad correctos', () => {
    renderCard();
    const card = screen.getByRole('button', { name: /Explorar categoría Conciertos/i });
    expect(card).toHaveAttribute('tabIndex', '0');
  });
});
