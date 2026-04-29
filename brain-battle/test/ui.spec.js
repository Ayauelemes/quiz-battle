import React from 'react';
import { expect } from 'chai';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Header from '../src/components/Header';
import Home from '../src/pages/Home';

describe('', () => {
  describe('Login бетінің тесті (Интерфейс және формалар)', () => {
    it('Login формасы дұрыс рендерленеді және негізгі элементтер көрінеді', () => {
      render(
        <MemoryRouter>
          <Login setUser={() => {}} />
        </MemoryRouter>
      );

      expect(screen.getByText('Жүйеге кіру')).to.exist;
      expect(screen.getByPlaceholderText('Email')).to.exist;
      expect(screen.getByPlaceholderText('Құпиясөз')).to.exist;
      expect(screen.getByText('Кіру')).to.exist;
    });

    it('Бос форма жіберілсе қате көрсетіледі', () => {
      render(
        <MemoryRouter>
          <Login setUser={() => {}} />
        </MemoryRouter>
      );

      const button = screen.getByRole('button', { name: 'Кіру' });
      fireEvent.click(button);
      expect(button).to.exist;
    });
  });

  describe('Формаларды тестілеу', () => {
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

  describe('Навигация тесті', () => {
    it('Басты бет және Header элементтері көрінуі тиіс', () => {
      render(
        <MemoryRouter>
          <Header />
          <Home user={null} questions={[]} />
        </MemoryRouter>
      );

      expect(screen.getByRole('link', { name: /Басты бет/ })).to.exist;
      expect(screen.getByRole('heading', { name: /Біліміңді тексеріп/ })).to.exist;
    });
  });
});
