// tests/controllers/authController.test.js

const authControllerInstance = require('../../controllers/authController');
const userModel = require('../../models/userModel');

// Mocking eksternal libraries
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Mocking dependencies
jest.mock('../../models/userModel');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
    // Mock crypto.randomBytes untuk konsistensi token
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'mockResetToken123456' })
}));


describe('AuthController (OOP)', () => {
    let req;
    let res;
    
    const MOCK_USER = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword123',
        role: 'user',
        nama_lengkap: 'Test User'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = { body: {}, user: { id: 1 } };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        // Setup dasar
        jwt.sign.mockReturnValue('mockedJWT');
        process.env.JWT_SECRET = 'test-secret';
        
        // **PERBAIKAN:** Pastikan bcrypt.hash tersedia untuk tes sukses resetPassword
        bcrypt.hash.mockResolvedValue('newhashedpassword'); 

        // Mock default successes
        userModel.findUserByIdentifier.mockResolvedValue(MOCK_USER);
        userModel.findUserByEmail.mockResolvedValue(MOCK_USER);
        userModel.findUserById.mockResolvedValue(MOCK_USER);
        userModel.updateProfile.mockResolvedValue(true);
        userModel.updateResetToken.mockResolvedValue(true);
        userModel.updatePasswordAndClearToken.mockResolvedValue(true);
    });
    
    const bind = (method) => method.bind(authControllerInstance);

    // --- Testing Login ---
    describe('login', () => {
        test('should return 400 if identifier or password is missing', async () => {
            req.body = { identifier: 'user', password: '' };
            await bind(authControllerInstance.login)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 401 if user not found', async () => {
            req.body = { identifier: 'user', password: 'password' };
            userModel.findUserByIdentifier.mockResolvedValue(null);
            await bind(authControllerInstance.login)(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return 401 if password is invalid', async () => {
            req.body = { identifier: 'user', password: 'wrongpassword' };
            bcrypt.compare.mockResolvedValue(false);
            await bind(authControllerInstance.login)(req, res);
            expect(res.status).toHaveBeenCalledWith(401);
        });

        test('should return 200 and JWT token on successful login', async () => {
            req.body = { identifier: 'user', password: 'correctpassword' };
            bcrypt.compare.mockResolvedValue(true);
            await bind(authControllerInstance.login)(req, res);
            expect(res.json).toHaveBeenCalledWith({ token: 'mockedJWT' });
        });
        
        // TEST CATCH BLOCK
        test('should return 500 if DB lookup fails during login', async () => {
            req.body = { identifier: 'user', password: 'pass' };
            userModel.findUserByIdentifier.mockRejectedValue(new Error('DB Lookup Error')); 

            await bind(authControllerInstance.login)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Terjadi kesalahan pada server.' });
        });
    });

    // --- Testing Forgot Password ---
    describe('forgotPassword', () => {
        test('should return 404 if email not found', async () => {
            req.body = { email: 'nonexistent@example.com' };
            userModel.findUserByEmail.mockResolvedValue(null);

            await bind(authControllerInstance.forgotPassword)(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should generate token and update model on success', async () => {
            req.body = { email: 'test@example.com' };

            await bind(authControllerInstance.forgotPassword)(req, res);

            expect(userModel.updateResetToken).toHaveBeenCalledWith(
                'mockResetToken123456', 
                expect.any(Number), 
                MOCK_USER.id
            );
        });
        
        // TEST CATCH BLOCK
        test('should return 500 if updating reset token fails', async () => {
            req.body = { email: 'user@mail.com' };
            userModel.updateResetToken.mockRejectedValue(new Error('DB Update Token Error'));

            await bind(authControllerInstance.forgotPassword)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing Reset Password ---
    describe('resetPassword', () => {
        test('should return 400 if token is invalid or expired', async () => {
            req.body = { token: 'badtoken', password: 'newpassword' };
            userModel.findUserByResetToken.mockResolvedValue(null);

            await bind(authControllerInstance.resetPassword)(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        // TEST SUKSES (Mengatasi kegagalan sebelumnya)
        test('should hash password and update model on success', async () => {
            req.body = { token: 'validtoken', password: 'newpassword' };
            userModel.findUserByResetToken.mockResolvedValue(MOCK_USER);

            await bind(authControllerInstance.resetPassword)(req, res);

            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
            expect(userModel.updatePasswordAndClearToken).toHaveBeenCalledWith(
                'newhashedpassword', // Menggunakan mock value dari beforeEach
                MOCK_USER.id
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Password berhasil direset.' });
        });
        
        // TEST CATCH BLOCK
        test('should return 500 if updating password fails', async () => {
            req.body = { token: 'valid', password: 'newpass' };
            userModel.findUserByResetToken.mockResolvedValue(MOCK_USER);
            userModel.updatePasswordAndClearToken.mockRejectedValue(new Error('DB Reset Fail'));

            await bind(authControllerInstance.resetPassword)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing Get Profile ---
    describe('getProfile', () => {
        test('should return 404 if user not found by ID', async () => {
            userModel.findUserById.mockResolvedValue(null);

            await bind(authControllerInstance.getProfile)(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should return 200 and profile data without password', async () => {
            const MOCK_PROFILE_DATA = { ...MOCK_USER, password: 'sensitive_hash' };
            userModel.findUserById.mockResolvedValue(MOCK_PROFILE_DATA);

            await bind(authControllerInstance.getProfile)(req, res);

            const expectedProfile = { ...MOCK_PROFILE_DATA };
            delete expectedProfile.password;

            expect(res.json).toHaveBeenCalledWith(expectedProfile);
        });
        
        // TEST CATCH BLOCK
        test('should return 500 if fetching profile fails', async () => {
            userModel.findUserById.mockRejectedValue(new Error('DB Profile Error'));

            await bind(authControllerInstance.getProfile)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- Testing Update Profile ---
    describe('updateProfile', () => {
        test('should call updateProfile model function with correct data', async () => {
            req.body = { nama_lengkap: 'New Name', email: 'new@email.com' };

            await bind(authControllerInstance.updateProfile)(req, res);

            expect(userModel.updateProfile).toHaveBeenCalledWith(
                'New Name', 
                'new@email.com', 
                req.user.id
            );
        });
        
        // TEST CATCH BLOCK
        test('should return 500 if update profile fails', async () => {
            req.body = { nama_lengkap: 'New', email: 'new@mail.com' };
            userModel.updateProfile.mockRejectedValue(new Error('DB Update Error'));

            await bind(authControllerInstance.updateProfile)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});