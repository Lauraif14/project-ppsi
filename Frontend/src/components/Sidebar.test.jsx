// src/components/Sidebar.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// mock framer-motion biar animasi nggak bikin ribet
jest.mock('framer-motion', () => ({
  motion: {
    aside: ({ children, ...props }) => <aside {...props}>{children}</aside>,
  },
}));

test('menampilkan menu dan teks BESTI saat awal', () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  // brand
  expect(screen.getByText(/BESTI/i)).toBeInTheDocument();

  // beberapa menu
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  expect(screen.getByText(/Data Master/i)).toBeInTheDocument();
  expect(screen.getByText(/Jadwal Piket/i)).toBeInTheDocument();
  expect(screen.getByText(/Informasi/i)).toBeInTheDocument();
});

test('teks menu menghilang ketika sidebar di-collapse', () => {
  render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );

  const toggleBtn = screen.getByRole('button');
  // awal: teks Dashboard ada
  expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();

  fireEvent.click(toggleBtn);

  // setelah collapse, label menu (span) seharusnya hilang
  // (tapi icon masih ada, jadi kita cek text-nya)
  expect(screen.queryByText(/Dashboard/i)).not.toBeInTheDocument();
});
