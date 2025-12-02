// src/admin/InformationPage.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import InformationPage from './InformationPage';
import api from '../api/axios';

// Mock Navbar & Sidebar biar simple
jest.mock('../components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('../components/Sidebar', () => () => <div data-testid="sidebar">Sidebar</div>);

// Mock axios instance
jest.mock('../api/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

// Mock window.alert & confirm
const originalAlert = window.alert;
const originalConfirm = window.confirm;
beforeAll(() => {
  window.alert = jest.fn();
  window.confirm = jest.fn();
});

afterAll(() => {
  window.alert = originalAlert;
  window.confirm = originalConfirm;
});

describe('InformationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem('token', 'dummy-token');
  });

  test('menampilkan loading lalu tabel dengan data', async () => {
    const mockData = [
      {
        id: 1,
        judul: 'Judul 1',
        isi: 'Isi 1',
        kategori: 'SOP',
        created_at: '2025-01-01T00:00:00Z',
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockData } });

    render(<InformationPage />);

    // awal: loading muncul
    expect(screen.getByText(/Memuat informasi/i)).toBeInTheDocument();

    // ⬇ sekarang kita benar-benar nunggu loading HILANG
    await waitFor(() =>
      expect(
        screen.queryByText(/Memuat informasi/i)
      ).not.toBeInTheDocument()
    );

    // data muncul di tabel
    expect(screen.getByText('Judul 1')).toBeInTheDocument();
    expect(screen.getByText('SOP')).toBeInTheDocument();
  });

  test('menampilkan error jika API gagal', async () => {
    api.get.mockRejectedValueOnce({
      response: { status: 500, data: { message: 'Server error' } },
      message: 'Request failed',
    });

    render(<InformationPage />);

    await waitFor(() =>
      expect(screen.getByText(/Error:/i)).toBeInTheDocument()
    );

    expect(
      screen.getByText(/Gagal memuat data \(HTTP 500\): Server error/i)
    ).toBeInTheDocument();
  });

  test('klik "Tambah Baru" membuka modal', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });

    render(<InformationPage />);

    await waitFor(() =>
      expect(
        screen.queryByText(/Memuat informasi/i)
      ).not.toBeInTheDocument()
    );

    const btnTambah = screen.getByRole('button', { name: /Tambah Baru/i });
    fireEvent.click(btnTambah);

    expect(screen.getByText(/Tambah Informasi/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Judul/i)).toBeInTheDocument();
  });

  test('hapus informasi memanggil api.delete ketika user konfirmasi', async () => {
    const mockData = [
      {
        id: 1,
        judul: 'Judul 1',
        isi: 'Isi 1',
        kategori: 'SOP',
        created_at: '2025-01-01T00:00:00Z',
      },
    ];

    // ⬇ dua kali: pertama saat mount, kedua saat fetchData() setelah delete
    api.get
      .mockResolvedValueOnce({ data: { data: mockData } }) // initial load
      .mockResolvedValueOnce({ data: { data: [] } });      // setelah delete refresh

    api.delete.mockResolvedValueOnce({ data: { message: 'OK' } });
    window.confirm.mockReturnValue(true); // user klik OK

    render(<InformationPage />);

    await waitFor(() =>
      expect(
        screen.queryByText(/Memuat informasi/i)
      ).not.toBeInTheDocument()
    );

    const btnHapus = screen.getByTitle('Hapus');
    fireEvent.click(btnHapus);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(
        '/informasi/1',
        expect.any(Object) // headers
      );
    });

    expect(window.alert).toHaveBeenCalledWith('Informasi berhasil dihapus.');
  });

  test('hapus informasi tidak memanggil api.delete ketika user batal', async () => {
    const mockData = [
      { id: 1, judul: 'Judul 1', isi: 'Isi 1', kategori: 'SOP', created_at: null },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockData } });
    window.confirm.mockReturnValue(false); // user klik Cancel

    render(<InformationPage />);

    await waitFor(() =>
      expect(
        screen.queryByText(/Memuat informasi/i)
      ).not.toBeInTheDocument()
    );

    const btnHapus = screen.getByTitle('Hapus');
    fireEvent.click(btnHapus);

    expect(api.delete).not.toHaveBeenCalled();
  });
});
