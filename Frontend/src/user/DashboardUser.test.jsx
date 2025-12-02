// src/user/DashboardUser.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import DashboardUser from './DashboardUser';

// mock api axios instance
jest.mock('../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

// mock child components yang berat/kompleks
jest.mock('./AbsensiKamera', () => () => <div data-testid="absensi-kamera" />);
jest.mock('./JadwalPiket', () => () => <div data-testid="jadwal-piket" />);
jest.mock('./ProfilSingkat', () => () => <div data-testid="profil-singkat" />);
jest.mock('../components/InformasiBanner', () => () => <div data-testid="informasi-banner" />);

// mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const api = require('../api/axios');

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
});

test('redirect ke /login kalau tidak ada token', async () => {
  // token kosong
  localStorage.removeItem('token');

  render(
    <MemoryRouter>
      <DashboardUser />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});

test('menampilkan tampilan "Mulai Sesi Piket" ketika belum ada sesi absen', async () => {
  localStorage.setItem('token', 'fake-token');

  api.get.mockImplementation((url) => {
    if (url === '/profile') {
      return Promise.resolve({
        data: {
          nama_lengkap: 'User Test',
          jabatan: 'Petugas',
          divisi: 'IT',
          avatar_url: '',
        },
      });
    }
    if (url === '/absensi/status') {
      return Promise.resolve({
        data: null, // belum ada sesi piket
      });
    }
    return Promise.resolve({ data: {} });
  });

  render(
    <MemoryRouter>
      <DashboardUser />
    </MemoryRouter>
  );

  // pastikan teks dashboard muncul
  expect(await screen.findByText(/Dashboard Piket/i)).toBeInTheDocument();
  expect(screen.getByText(/Selamat datang, User Test/i)).toBeInTheDocument();

  // tampilan mulai piket
  expect(screen.getByText(/Mulai Sesi Piket/i)).toBeInTheDocument();
  expect(screen.getByText(/Ambil Absen Masuk/i)).toBeInTheDocument();
});

test('menampilkan status "Sedang Piket" ketika sudah ada sesi absen', async () => {
  localStorage.setItem('token', 'fake-token');

  const waktuMasuk = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 jam lalu

  api.get.mockImplementation((url) => {
    if (url === '/profile') {
      return Promise.resolve({
        data: {
          nama_lengkap: 'User Test',
          jabatan: 'Petugas',
          divisi: 'IT',
          avatar_url: '',
        },
      });
    }
    if (url === '/absensi/status') {
      return Promise.resolve({
        data: {
          id: 1,
          waktu_masuk: waktuMasuk,
          checklist_submitted: false,
          inventaris_checklist: JSON.stringify([]),
        },
      });
    }
    return Promise.resolve({ data: {} });
  });

  render(
    <MemoryRouter>
      <DashboardUser />
    </MemoryRouter>
  );

  // pastikan card "Sedang Piket" muncul
  expect(await screen.findByText(/Sedang Piket/i)).toBeInTheDocument();
  expect(screen.getByText(/Masuk:/i)).toBeInTheDocument();
});
