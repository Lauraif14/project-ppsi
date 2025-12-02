// src/components/InformasiBanner.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import InformasiBanner from './InformasiBanner';
import api from '../api/axios';

jest.mock('../api/axios', () => ({
  get: jest.fn(),
}));

describe('InformasiBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'dummy-token');
  });

  test('tidak render apapun saat loading dan data kosong', async () => {
    api.get.mockResolvedValueOnce({ data: { data: [] } });

    const { container } = render(<InformasiBanner maxItems={3} />);

    // loading: component return null → tidak ada teks "Informasi"
    expect(container).not.toHaveTextContent(/Informasi/i);

    await waitFor(() => {
      // setelah selesai, karena data kosong, tetap return null
      expect(container).not.toHaveTextContent(/Informasi/i);
    });
  });

  test('menampilkan judul dan link "Lihat semua" ketika ada data', async () => {
    const mockData = [
      { id: 1, judul: 'Judul A', isi: 'Isi A', kategori: 'SOP', created_at: '2025-01-01' },
      { id: 2, judul: 'Judul B', isi: 'Isi B', kategori: 'Panduan', created_at: '2025-01-02' },
    ];

    api.get.mockResolvedValueOnce({ data: { data: mockData } });

    render(<InformasiBanner maxItems={3} />);

    await waitFor(() =>
      expect(screen.getByText(/Informasi/i)).toBeInTheDocument()
    );

    expect(screen.getByText('Judul A')).toBeInTheDocument();
    expect(screen.getByText(/Lihat semua/i)).toBeInTheDocument();

    const link = screen.getByText(/Lihat semua/i);
    expect(link).toHaveAttribute('href', '/informasi');
  });
});
