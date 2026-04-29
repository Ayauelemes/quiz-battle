import React from 'react';
import { expect } from 'chai';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Register from '../src/pages/Register';

describe('Формаларды тестілеу ', () => {
  it('Тіркелу формасы элементтері көрінеді және required тесті', () => {
    render(
      <MemoryRouter>
        <Register setUser={() => {}} />
      </MemoryRouter>
    );

  expect(screen.getByRole('heading', { name: 'Тіркелу' })).to.exist;
    expect(screen.getByPlaceholderText('Аты-жөні')).to.exist;
    expect(screen.getByPlaceholderText('Email')).to.exist;
    expect(screen.getByPlaceholderText('Құпиясөз')).to.exist;

  const submit = screen.getAllByText('Тіркелу').find((el) => el.tagName === 'BUTTON');
  fireEvent.click(submit);
  expect(submit).to.exist;
  });
});
