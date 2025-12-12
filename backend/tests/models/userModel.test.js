// tests/models/userModel.test.js (FINAL & 100% COVERAGE)

// 1. Mock Database (MENGGANTIKAN KONEKSI DATABASE ASLI)
const db = require('../../db'); 

// Mocks database module (agar tidak benar-benar terhubung ke DB)
jest.mock('../../db', () => ({
    query: jest.fn(), 
    execute: jest.fn(),
}));

// 2. Import Model yang ingin diuji
const UserModel = require('../../models/userModel');

describe('UserModel', () => {
    
    const mockQuery = db.query;
    const mockExecute = db.execute;

    beforeEach(() => {
        // Clear mock calls sebelum setiap test
        mockQuery.mockClear(); 
        mockExecute.mockClear();
        // Default mock untuk find/select
        mockQuery.mockResolvedValue([[]]); 
        mockExecute.mockResolvedValue([[]]);
    });

    // --- AUTENTIKASI & PENCARIAN ---
    describe('Authentication and Find Operations', () => {
        
        test('findUserByIdentifier should call db.query with OR logic', async () => {
            const mockUser = { id: 1, username: 'test' };
            mockQuery.mockResolvedValue([[mockUser]]);

            const result = await UserModel.findUserByIdentifier('test@mail.com');
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM users WHERE username = ? OR email = ?');
            expect(result).toEqual(mockUser);
        });

        test('findUserByIdentifier should return null if not found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await UserModel.findUserByIdentifier('notfound@test.com');
            expect(result).toBeNull();
        });

        test('findUserByResetToken should check both token and expiry', async () => {
            const mockToken = '123abc';
            const mockExpiry = 1735689600000; 
            mockQuery.mockResolvedValue([[{ id: 10 }]]);

            await UserModel.findUserByResetToken(mockToken, mockExpiry);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?');
        });

        test('findUserByResetToken should return null if not found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await UserModel.findUserByResetToken('invalid', 123456);
            expect(result).toBeNull();
        });

        test('findUserByEmail should return user', async () => {
            const mockUser = { id: 3, email: 'test@test.com' };
            mockQuery.mockResolvedValue([[mockUser]]);
            const result = await UserModel.findUserByEmail('test@test.com');
            expect(result).toEqual(mockUser);
        });

        test('findUserByEmail should return null if not found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await UserModel.findUserByEmail('notfound@test.com');
            expect(result).toBeNull();
        });
        
        test('findUserByUsername should use db.execute', async () => {
            const mockRow = { id: 5 };
            mockExecute.mockResolvedValue([[mockRow]]);

            const result = await UserModel.findUserByUsername('adminuser');
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('SELECT id FROM users WHERE username = ?');
        });

        test('findUserByUsername should return null if not found', async () => {
            mockExecute.mockResolvedValue([[]]);
            const result = await UserModel.findUserByUsername('notfound');
            expect(result).toBeNull();
        });
        
        test('findUserByNamaLengkap should call db.query with correct WHERE clause', async () => {
            const mockRow = { id: 7, nama_lengkap: 'Ani' };
            mockQuery.mockResolvedValue([[mockRow]]);

            const result = await UserModel.findUserByNamaLengkap('Ani');

            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('SELECT id, nama_lengkap FROM users WHERE nama_lengkap = ?');
            expect(result).toEqual(mockRow);
        });
        
        test('findUserByNamaLengkap returns null if not found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await UserModel.findUserByNamaLengkap('NotFound');
            expect(result).toBeNull();
        });

        test('findUserById should return user data', async () => {
            const mockUser = { id: 5, username: 'testuser', email: 'test@test.com' };
            mockExecute.mockResolvedValue([[mockUser]]);

            const result = await UserModel.findUserById(5);
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('SELECT id, nama_lengkap, username, email, jabatan, role, divisi FROM users WHERE id = ?');
            expect(result).toEqual(mockUser);
        });

        test('findUserById should return null if not found', async () => {
            mockExecute.mockResolvedValue([[]]);

            const result = await UserModel.findUserById(999);
            expect(result).toBeNull();
        });
    });

    // --- DATA MASTER & LAPORAN ---
    describe('Data Master and Report Operations', () => {
        
        test('getAllUsers should select non-admin users with specific fields', async () => {
            mockExecute.mockResolvedValue([[{ id: 1, username: 'user1' }]]);

            await UserModel.getAllUsers();
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('SELECT id, username, email, nama_lengkap, jabatan, divisi FROM users WHERE role = "user"');
        });

        test('getAllUsersComplete should select all fields and order by ID DESC', async () => {
            mockExecute.mockResolvedValue([[{ id: 1, username: 'user1' }]]);
            await UserModel.getAllUsersComplete();
            expect(mockExecute).toHaveBeenCalledTimes(1);
            
            // FIX: Menggunakan RegEx fleksibel (\s+ untuk spasi/newline)
            expect(mockExecute.mock.calls[0][0]).toMatch(
                /SELECT\s+id,\s+nama_lengkap,\s+username,\s+email,\s+jabatan,\s+role,\s+divisi\s+FROM users\s+ORDER BY id DESC/
            );
        });

        test('countAdmins should return the correct count', async () => {
            mockExecute.mockResolvedValue([[{ count: 3 }]]);

            const count = await UserModel.countAdmins();
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(count).toBe(3);
        });
        
        test('getAllPengurus should select ID and nama_lengkap for admin and user roles', async () => {
            const mockPengurusList = [{ id: 1, nama_lengkap: 'A' }, { id: 2, nama_lengkap: 'B' }];
            mockExecute.mockResolvedValue([mockPengurusList]);

            const result = await UserModel.getAllPengurus();
            
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('SELECT id, nama_lengkap FROM users WHERE role IN ("admin", "user") ORDER BY nama_lengkap');
            expect(result).toEqual(mockPengurusList);
        });
    });

    // --- WRITE/UPDATE ---
    describe('Write and Update Operations', () => {
        const MOCK_USER_DATA = { 
            nama_lengkap: 'Budi Test', username: 'budi', email: 'budi@mail.com', 
            jabatan: 'Staff', divisi: 'IT', role: 'user'
        };
        const MOCK_HASH = 'mockhashedpass';

        test('createUser should call db.execute with all required parameters and default role', async () => {
            mockExecute.mockResolvedValue([{ insertId: 20 }]); 
            await UserModel.createUser(MOCK_USER_DATA, MOCK_HASH);
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][1]).toEqual([
                'Budi Test', 'budi', 'budi@mail.com', MOCK_HASH, 'Staff', 'IT', 'user' 
            ]);
        });
        
        test('createUser should apply default values for null/missing fields', async () => {
            mockExecute.mockResolvedValue([{ insertId: 21 }]);
            const minimalData = { nama_lengkap: 'Ani', username: 'aniuser', divisi: 'HR' };

            await UserModel.createUser(minimalData, MOCK_HASH);
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][1]).toEqual([
                'Ani', 'aniuser', null, MOCK_HASH, null, 'HR', 'user'
            ]);
        });

        test('updateUser should correctly update specified fields', async () => {
            const dataToUpdate = {
                nama_lengkap: 'Updated Name', email: 'upd@mail.com', 
                jabatan: 'Manager', role: 'admin', divisi: 'Finance'
            };
            mockExecute.mockResolvedValue([{}]);

            await UserModel.updateUser(5, dataToUpdate);
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('UPDATE users SET nama_lengkap = ?, email = ?, jabatan = ?, role = ?, divisi = ? WHERE id = ?');
        });

        test('updateProfile should update nama_lengkap and email', async () => {
            mockQuery.mockResolvedValue([{}]);
            await UserModel.updateProfile('New Name', 'new@mail.com', 10);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE users SET nama_lengkap = ?, email = ? WHERE id = ?');
        });
        
        test('updatePassword should update password field', async () => {
            mockExecute.mockResolvedValue([{}]);
            await UserModel.updatePassword(1, 'newhash');
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('UPDATE users SET password = ? WHERE id = ?');
        });

        test('updatePasswordAndClearToken should clear resetToken fields', async () => {
            mockQuery.mockResolvedValue([{}]);
            
            await UserModel.updatePasswordAndClearToken('newhash', 10);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE users SET password = ?, resetToken = NULL, resetTokenExpiry = NULL WHERE id = ?');
        });
        
        test('updateResetToken should update token and expiry', async () => {
            mockQuery.mockResolvedValue([{}]);
            await UserModel.updateResetToken('token', 12345, 1);
            expect(mockQuery).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls[0][0]).toBe('UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?');
        });

        test('deleteUser should execute DELETE FROM users and return affectedRows', async () => { 
            mockExecute.mockResolvedValue([{ affectedRows: 1 }]);
            const result = await UserModel.deleteUser(5);
            expect(mockExecute).toHaveBeenCalledTimes(1);
            expect(mockExecute.mock.calls[0][0]).toBe('DELETE FROM users WHERE id = ?');
            expect(result).toBe(1);
        });
    });
    
    // --- TESTING ERROR PATHS ---
    describe('Error Paths', () => {
        test('findUserByEmail should return null on no rows found', async () => {
            mockQuery.mockResolvedValue([[]]);
            const result = await UserModel.findUserByEmail('unknown@mail.com');
            expect(result).toBeNull();
        });

        test('updatePassword should throw error if db operation fails', async () => {
            mockExecute.mockRejectedValue(new Error('DB Timeout'));

            await expect(UserModel.updatePassword(1, 'somehash'))
                .rejects.toThrow('DB Timeout');
        });
        
        test('findUserByNamaLengkap should throw error if query fails', async () => {
            mockQuery.mockRejectedValue(new Error('Name Lookup Failed'));
            
            await expect(UserModel.findUserByNamaLengkap('Test Name'))
                .rejects.toThrow('Name Lookup Failed');
        });
        
        test('getAllPengurus should throw error if db operation fails', async () => {
            mockExecute.mockRejectedValue(new Error('Pengurus Fetch Error'));
            
            await expect(UserModel.getAllPengurus())
                .rejects.toThrow('Pengurus Fetch Error');
        });
    });
});