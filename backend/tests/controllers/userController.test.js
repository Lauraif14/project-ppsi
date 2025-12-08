// tests/controllers/userController.test.js

const userControllerInstance = require('../../controllers/userController'); 
const UserModel = require('../../models/userModel');
const { parseUploadedFile, cleanupFile } = require('../../utils/uploadUtils');
const bcrypt = require('bcryptjs');

// Mocking dependencies
jest.mock('../../models/userModel');
jest.mock('../../utils/uploadUtils');
jest.mock('bcryptjs');

const MOCK_USER = { id: '10', username: 'testuser', email: 'test@mail.com', role: 'user', nama_lengkap: 'Test User' };

describe('UserController (OOP)', () => {
    let req;
    let res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        req = { body: {}, params: {}, user: { id: '10' }, file: null, query: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

        // Setup mock umum
        bcrypt.hash.mockResolvedValue('hashed_password_mock');
        UserModel.findUserById.mockResolvedValue(MOCK_USER);
        UserModel.findUserByEmail.mockResolvedValue(null);
        UserModel.findUserByUsername.mockResolvedValue(null);
        UserModel.countAdmins.mockResolvedValue(5); 
        UserModel.deleteUser.mockResolvedValue(1); 
        UserModel.updateUser.mockResolvedValue(1);
        UserModel.getAllUsers.mockResolvedValue([]);
        UserModel.getAllUsersComplete.mockResolvedValue([]);
        UserModel.createUser.mockResolvedValue(20);
    });

    const bind = (method) => method.bind(userControllerInstance);

    // --- Testing Get User Lists ---
    describe('getAllUsers & getAllUsersComplete', () => {
        test('should return 500 on database fetch error (getAllUsers)', async () => {
            UserModel.getAllUsers.mockRejectedValue(new Error('Fetch Error'));
            await bind(userControllerInstance.getAllUsers)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
        
        test('should return 500 on getAllUsersComplete failure', async () => {
            UserModel.getAllUsersComplete.mockRejectedValue(new Error('Complete Fetch Error'));
            await bind(userControllerInstance.getAllUsersComplete)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
        
        test('should return list of non-admin users for getAllUsers', async () => {
            const mockRows = [{ id: 1, role: 'user' }];
            UserModel.getAllUsers.mockResolvedValue(mockRows);
            await bind(userControllerInstance.getAllUsers)(req, res);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockRows });
        });
    });

    // --- Testing Create User ---
    describe('createUser', () => {
        beforeEach(() => {
            req.body = { nama_lengkap: 'A', username: 'a', divisi: 'D', password: 'p' };
        });
        
        test('should return 400 if any required field is missing', async () => {
            req.body = { username: 'a', divisi: 'D', password: 'p' }; 
            await bind(userControllerInstance.createUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 400 if username already exists', async () => {
            UserModel.findUserByUsername.mockResolvedValue(MOCK_USER);
            await bind(userControllerInstance.createUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        
        test('should return 500 if DB fails during creation', async () => {
            UserModel.createUser.mockRejectedValue(new Error('DB Create Error'));
            await bind(userControllerInstance.createUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('createAccount (Helper Validation Coverage)', () => {
        beforeEach(() => {
            // Default input yang valid
            req.body = { 
                nama_lengkap: 'Valid User', username: 'newacc', email: 'new@mail.com', 
                divisi: 'IT', jabatan: 'Staf', password: 'password123456', role: 'user'
            };
        });

        test('should return 400 if nama_lengkap is too short (< 2)', async () => {
            req.body.nama_lengkap = 'A';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('nama_lengkap');
        });

        test('should return 400 if username is too short (< 3)', async () => {
            req.body.username = 'ab';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('username');
        });

        test('should return 400 if email format is invalid', async () => {
            req.body.email = 'invalid-email';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('email');
        });
        
        test('should return 400 if jabatan is missing/empty', async () => {
            req.body.jabatan = '';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('jabatan');
        });
        
        test('should return 400 if divisi is missing/empty', async () => {
            req.body.divisi = '';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('divisi');
        });

        test('should return 400 if role is invalid', async () => {
            req.body.role = 'superadmin';
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json.mock.calls[0][0].errors).toHaveProperty('role');
        });
        
        test('should succeed if all fields are valid', async () => {
            // Memastikan jalur sukses teruji setelah semua validasi gagal di atas
            await bind(userControllerInstance.createAccount)(req, res);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    // --- Testing Update User ---
    describe('updateUser', () => {
        beforeEach(() => {
            req.params = { id: '5' };
            req.body = { 
                nama_lengkap: 'Updated User Name', 
                username: 'validuser',            
                email: 'valid@mail.com',          
                jabatan: 'Manager',
                divisi: 'Finance',
                role: 'user',
                password: 'validpassword'        
            }; 
            UserModel.findUserById.mockResolvedValue({ id: '5' }); 
            UserModel.findUserByEmail.mockResolvedValue({ id: '5' }); 
        });
        
        test('should return 404 if user not found', async () => {
            UserModel.findUserById.mockResolvedValue(null);
            await bind(userControllerInstance.updateUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        
        test('should return 500 if DB update fails', async () => {
            UserModel.updateUser.mockRejectedValue(new Error('DB Update Error'));
            await bind(userControllerInstance.updateUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        test('should update user info successfully (Happy Path)', async () => {
            await bind(userControllerInstance.updateUser)(req, res);
            expect(UserModel.updateUser).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User berhasil diupdate' }));
        });
        
        test('should return 400 if email is used by another user', async () => {
            req.params = { id: '5' };
            UserModel.findUserByEmail.mockResolvedValue({ id: '6' }); // Email used by ID 6
            await bind(userControllerInstance.updateUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should successfully update when role is changed to admin', async () => {
            req.body.role = 'admin';
            await bind(userControllerInstance.updateUser)(req, res);
            expect(UserModel.updateUser).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'User berhasil diupdate' }));
        });
    });

    // --- Testing Delete User ---
    describe('deleteUser', () => {
        beforeEach(() => {
            req.params = { id: '10' };
            UserModel.findUserById.mockResolvedValue(MOCK_USER);
            UserModel.countAdmins.mockResolvedValue(5); 
        });

        test('should return 404 if user not found before deletion', async () => {
            UserModel.findUserById.mockResolvedValue(null);
            await bind(userControllerInstance.deleteUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        
        test('should return 404 if no rows affected', async () => {
            UserModel.deleteUser.mockResolvedValue(0); 
            await bind(userControllerInstance.deleteUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });
        
        test('should return 500 if DB delete fails', async () => {
            UserModel.deleteUser.mockRejectedValue(new Error('DB Delete Error'));
            await bind(userControllerInstance.deleteUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });

        test('should return 400 if trying to delete last admin', async () => {
            UserModel.findUserById.mockResolvedValue({ ...MOCK_USER, role: 'admin' });
            UserModel.countAdmins.mockResolvedValue(1); 
            await bind(userControllerInstance.deleteUser)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
    });
    
    // --- Testing Reset Password ---
    describe('resetPassword', () => {
        beforeEach(() => {
            req.params = { id: '10' };
            req.body = { new_password: 'newpassword123' };
            UserModel.findUserById.mockResolvedValue(MOCK_USER); 
        });

        test('should return 400 if new_password is too short', async () => {
            req.body = { new_password: 'p' };
            await bind(userControllerInstance.resetPassword)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('should return 500 if DB update fails during reset', async () => {
            UserModel.updatePassword.mockRejectedValue(new Error('DB Reset Fail'));
            await bind(userControllerInstance.resetPassword)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
    
    // --- Testing bulkCreatePengurus ---
    describe('bulkCreatePengurus', () => {
        beforeEach(() => {
            req.file = { path: 'mock/file.xlsx', originalname: 'data.xlsx' };
            parseUploadedFile.mockReturnValue([
                { nama_lengkap: 'Test', username: 'abc', email: 'test@a.com', divisi: 'D', jabatan: 'J' },
            ]);
            UserModel.createUser.mockResolvedValue(20);
            UserModel.findUserByUsername.mockResolvedValue(null);
            UserModel.findUserByEmail.mockResolvedValue(null);
        });
        
        test('should return 400 if file parsing fails', async () => {
            parseUploadedFile.mockImplementation(() => { throw new Error('Format salah'); });
            await bind(userControllerInstance.bulkCreatePengurus)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        
        test('should return 400 if file is empty', async () => {
            parseUploadedFile.mockReturnValue([]);
            await bind(userControllerInstance.bulkCreatePengurus)(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });
        
        test('should return 201 but report error if DB fails during row processing loop', async () => {
            UserModel.createUser.mockRejectedValue(new Error('Loop DB Error')); 
            await bind(userControllerInstance.bulkCreatePengurus)(req, res);
            expect(res.status).toHaveBeenCalledWith(201); 
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1);
        });
        
        test('should report error for duplicate usernames within the input file', async () => {
            parseUploadedFile.mockReturnValue([
                { nama_lengkap: 'User A', username: 'dupe_set', email: 'a@a.com', divisi: 'D', jabatan: 'J' },
                { nama_lengkap: 'User B', username: 'dupe_set', email: 'b@b.com', divisi: 'D', jabatan: 'J' }, 
            ]);
            
            await bind(userControllerInstance.bulkCreatePengurus)(req, res);
            
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json.mock.calls[0][0].data.total_success).toBe(1); 
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1); 
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('Username dupe_set sudah digunakan');
        });

        test('should report error for DB duplicates during loop processing', async () => {
            // Kita mock data input agar menggunakan username MOCK_USER ('testuser')
            parseUploadedFile.mockReturnValue([
                { nama_lengkap: 'User A', username: 'testuser', email: 'a@a.com', divisi: 'D', jabatan: 'J' },
            ]);
            // UserModel.findUserByUsername akan mengembalikan user (duplikasi)
            UserModel.findUserByUsername.mockResolvedValue(MOCK_USER); 

            await bind(userControllerInstance.bulkCreatePengurus)(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json.mock.calls[0][0].data.total_errors).toBe(1);
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('Username testuser sudah digunakan');
            expect(res.json.mock.calls[0][0].data.errors[0]).toContain('Username testuser sudah digunakan');
        });
    });
});