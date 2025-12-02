// src/components/SopPanduan.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SopPanduan from './SopPanduan';
import api from '../api/axios';

jest.mock('../api/axios', () => ({
  get: jest.fn(),
}));

describe('SopPanduan', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'dummy-token');
  });

  test('menampilkan loading di awal', () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });

    render(<SopPanduan />);

    expect(screen.getByText(/Memuat informasi/i)).toBeInTheDocument();
  });

  test('menampilkan pesan kosong ketika tidak ada data', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });

    render(<SopPanduan />);

    await waitFor(() =>
      expect(screen.queryByText(/Memuat informasi/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText(/Belum ada informasi/i)).toBeInTheDocument();
  });

  test('menampilkan list informasi ketika API mengembalikan data', async () => {
    const mockData = [
      {
        id: 1,
        judul: 'Judul SOP',
        isi: 'Isi SOP',
        kategori: 'SOP',
        created_at: '2025-01-01T00:00:00Z',
        file_path: 'uploads/informasi/sop1.pdf',
      },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockData } });

    render(<SopPanduan />);

    await waitFor(() =>
      expect(screen.queryByText(/Memuat informasi/i)).not.toBeInTheDocument()
    );

    expect(screen.getByText('Judul SOP')).toBeInTheDocument();
    expect(screen.getByText('SOP')).toBeInTheDocument();
    expect(screen.getByText('Isi SOP')).toBeInTheDocument();

    // link "Buka file"
    const link = screen.getByText(/Buka file/i);
    expect(link).toBeInTheDocument();
  });
});
