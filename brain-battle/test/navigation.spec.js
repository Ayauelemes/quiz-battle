import React from 'react';
import { expect } from 'chai';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../src/components/Header';
import Home from '../src/pages/Home';

describe('Навигация тесті', () => {
  it('Басты бет және Header элементтері көрінеді', () => {
    // Render only Header + Home inside a MemoryRouter to avoid mounting App's BrowserRouter
    render(
      <MemoryRouter>
        <Header />
        <Home user={null} questions={[]} />
      </MemoryRouter>
    );

    // Header should have a link labeled 'Басты бет' and Home should have the main heading
    expect(screen.getByRole('link', { name: /Басты бет/ })).to.exist;
    expect(screen.getByRole('heading', { name: /Біліміңді тексеріп/ })).to.exist;
  });
});
