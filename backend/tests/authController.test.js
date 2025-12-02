// tests/authController.test.js

const authController = require('../controllers/authController');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Mock module2 eksternal
jest.mock('../db');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto');

const mockRequest = (body = {}, user = {}) => ({
  body,
  user,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret';
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('authController.login', () => {
  test('mengembalikan 400 jika identifier atau password kosong', async () => {
    const req = mockRequest({ identifier: '', password: '' });
    const res = mockResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username/email dan password harus diisi.',
    });
  });

  test('mengembalikan 401 jika user tidak ditemukan', async () => {
    db.query.mockResolvedValueOnce([[]]); // rows = []

    const req = mockRequest({ identifier: 'user', password: 'pass' });
    const res = mockResponse();

    await authController.login(req, res);

    expect(db.query).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username/email atau password salah.',
    });
  });

  test('mengembalikan 401 jika password tidak valid', async () => {
    const fakeUser = {
      id: 1,
      username: 'user',
      email: 'user@mail.com',
      password: 'hashed-password',
      role: 'admin',
      nama_lengkap: 'User Admin',
    };

    db.query.mockResolvedValueOnce([[fakeUser]]);
    bcrypt.compare.mockResolvedValueOnce(false); // password salah

    const req = mockRequest({ identifier: 'user', password: 'wrongpass' });
    const res = mockResponse();

    await authController.login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'wrongpass',
      fakeUser.password
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Username/email atau password salah.',
    });
  });

  test('mengembalikan token jika login berhasil', async () => {
    const fakeUser = {
      id: 1,
      username: 'user',
      email: 'user@mail.com',
      password: 'hashed-password',
      role: 'admin',
      nama_lengkap: 'User Admin',
    };

    db.query.mockResolvedValueOnce([[fakeUser]]);
    bcrypt.compare.mockResolvedValueOnce(true);
    jwt.sign.mockReturnValue('fake-jwt-token');

    const req = mockRequest({ identifier: 'user', password: 'correctpass' });
    const res = mockResponse();

    await authController.login(req, res);

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: fakeUser.id, role: fakeUser.role, name: fakeUser.nama_lengkap },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    expect(res.json).toHaveBeenCalledWith({ token: 'fake-jwt-token' });
  });

  test('mengembalikan 500 jika terjadi error pada server', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest({ identifier: 'user', password: 'pass' });
    const res = mockResponse();

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server.',
    });
  });
});

describe('authController.forgotPassword', () => {
  test('mengembalikan 404 jika email tidak ditemukan', async () => {
    db.query.mockResolvedValueOnce([[]]); // SELECT ... WHERE email

    const req = mockRequest({ email: 'notfound@mail.com' });
    const res = mockResponse();

    await authController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email tidak ditemukan.',
    });
  });

  test('berhasil generate reset token dan kirim response sukses', async () => {
    const fakeUser = { id: 1, email: 'user@mail.com' };

    db.query
      .mockResolvedValueOnce([[fakeUser]]) // SELECT user
      .mockResolvedValueOnce([{}]); // UPDATE user

    // mock crypto.randomBytes -> Buffer
    crypto.randomBytes.mockReturnValueOnce(Buffer.from('reset-token'));

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const req = mockRequest({ email: 'user@mail.com' });
    const res = mockResponse();

    await authController.forgotPassword(req, res);

    expect(db.query).toHaveBeenCalledTimes(2);
    expect(crypto.randomBytes).toHaveBeenCalledWith(32);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Link reset password telah dikirim (cek konsol backend).',
    });

    consoleSpy.mockRestore();
  });

  test('mengembalikan 500 jika terjadi error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest({ email: 'user@mail.com' });
    const res = mockResponse();

    await authController.forgotPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server.',
    });
  });
});

describe('authController.resetPassword', () => {
  test('mengembalikan 400 jika token tidak valid atau expired', async () => {
    db.query.mockResolvedValueOnce([[]]); // user tidak ada

    const req = mockRequest({ token: 'invalid', password: 'newpass' });
    const res = mockResponse();

    await authController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token tidak valid atau sudah kedaluwarsa.',
    });
  });

  test('berhasil reset password jika token valid', async () => {
    const fakeUser = { id: 1, resetToken: 'valid-token' };

    db.query
      .mockResolvedValueOnce([[fakeUser]]) // SELECT user by token
      .mockResolvedValueOnce([{}]); // UPDATE password

    bcrypt.hash.mockResolvedValueOnce('new-hashed-password');

    const req = mockRequest({ token: 'valid-token', password: 'newpass' });
    const res = mockResponse();

    await authController.resetPassword(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
    expect(db.query).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Password berhasil direset.',
    });
  });

  test('mengembalikan 500 jika terjadi error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest({ token: 't', password: 'p' });
    const res = mockResponse();

    await authController.resetPassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server.',
    });
  });
});

describe('authController.getProfile', () => {
  test('mengembalikan data user jika ditemukan', async () => {
    const fakeUser = {
      id: 1,
      username: 'user',
      email: 'user@mail.com',
      role: 'admin',
      nama_lengkap: 'User Admin',
    };

    db.query.mockResolvedValueOnce([[fakeUser]]);

    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    await authController.getProfile(req, res);

    expect(db.query).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(fakeUser);
  });

  test('mengembalikan 404 jika user tidak ditemukan', async () => {
    db.query.mockResolvedValueOnce([[]]);

    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    await authController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User tidak ditemukan',
    });
  });

  test('mengembalikan 500 jika terjadi error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest({}, { id: 1 });
    const res = mockResponse();

    await authController.getProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server.',
    });
  });
});

describe('authController.updateProfile', () => {
  test('berhasil update profile', async () => {
    db.query.mockResolvedValueOnce([{}]);

    const req = mockRequest(
      { nama_lengkap: 'Baru', email: 'baru@mail.com' },
      { id: 1 }
    );
    const res = mockResponse();

    await authController.updateProfile(req, res);

    expect(db.query).toHaveBeenCalledWith(
      'UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?',
      ['Baru', 'baru@mail.com', 1]
    );
    expect(res.json).toHaveBeenCalledWith({
      message: 'Profil berhasil diperbarui',
    });
  });

  test('mengembalikan 500 jika terjadi error', async () => {
    db.query.mockRejectedValueOnce(new Error('DB error'));

    const req = mockRequest(
      { nama_lengkap: 'Baru', email: 'baru@mail.com' },
      { id: 1 }
    );
    const res = mockResponse();

    await authController.updateProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server.',
    });
  });
});
