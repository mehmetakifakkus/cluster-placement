// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import App from './App';

const blocks = () => document.querySelectorAll('[data-testid="layout"] [data-file]');
const settle = () => act(() => vi.advanceTimersByTime(400)); // past the 300 ms recompute delay

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Stüdyo', () => {
  test('opens with the design example laid out', () => {
    render(<App />);
    expect(blocks()).toHaveLength(10);
    const tree = screen.getByRole('complementary', { name: 'Ayrıntılar' });
    for (const name of ['design', 'renderdesign', 'sketchv']) {
      expect(within(tree).getByRole('button', { name: new RegExp(`^${name}`) })).toBeTruthy();
    }
    expect(screen.getByTestId('metric-fitness').textContent).not.toBe('–');
  });

  test('pasted text adds files and the layout updates', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Metin olarak yapıştır' }));
    fireEvent.change(screen.getByLabelText(/Her satıra bir dosya/), {
      target: { value: 'kapak.png, 1200, 800\n\nlogo.ai\n' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Listeye ekle' }));

    expect(screen.getByText('12 dosya')).toBeTruthy();
    settle();
    expect(blocks()).toHaveLength(12);
  });

  test('a file of unknown size can be given a size', () => {
    render(<App initialExample="mixed" />);
    const width = screen.getByLabelText('logo.ai genişlik');
    const height = screen.getByLabelText('logo.ai yükseklik');
    fireEvent.change(width, { target: { value: '1600' } });
    fireEvent.change(height, { target: { value: '800' } });
    fireEvent.blur(height);

    expect(screen.queryByLabelText('logo.ai genişlik')).toBeNull();
    expect(screen.getByText('1600×800')).toBeTruthy();
  });

  test('selecting a cluster dims the blocks of other clusters', () => {
    render(<App />);
    const tree = screen.getByRole('complementary', { name: 'Ayrıntılar' });
    const sketch = within(tree).getByRole('button', { name: /^sketchv/ });
    fireEvent.click(sketch);

    expect(sketch.getAttribute('aria-pressed')).toBe('true');
    const dimmed = Array.from(blocks()).filter((b) => b.getAttribute('class').includes('dim'));
    expect(dimmed).toHaveLength(7); // everything but the 3 sketchv files
  });

  test('a block removed while hovered does not leave the others dimmed', () => {
    render(<App />);
    fireEvent.mouseEnter(blocks()[0]); // no mouseleave follows: the block goes away
    fireEvent.change(screen.getByLabelText('Örnek'), { target: { value: 'mixed' } });
    settle();

    expect(blocks().length).toBeGreaterThan(0);
    const dimmed = Array.from(blocks()).filter((b) => b.getAttribute('class').includes('dim'));
    expect(dimmed).toHaveLength(0);
  });

  test('removing every file shows the empty state', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Temizle' }));
    settle();
    expect(blocks()).toHaveLength(0);
    expect(screen.getByText('Henüz dosya yok')).toBeTruthy();
  });

  test('changing the goal slider recomputes after a short delay', () => {
    render(<App />);
    const before = screen.getByTestId('metric-fitness').textContent;
    fireEvent.change(screen.getByLabelText('Hedef'), { target: { value: '0' } });
    expect(screen.getByTestId('metric-fitness').textContent).toBe(before); // not yet
    settle();
    // At weight 0 the fitness is the fill percentage.
    const fill = screen.getByTestId('metric-fill').textContent.slice(1);
    expect(Math.round(Number(screen.getByTestId('metric-fitness').textContent))).toBe(Number(fill));
  });
});
