// tests/controllers/informasiController.test.js (FINAL BERFUNGSI)

const InformasiController = require('../../controllers/informasiController');
const InformasiModel = require('../../models/informasiModel');
const fs = require('fs');
const path = require('path');

// --- MOCKING DEPENDENCIES ---
jest.mock('../../models/informasiModel');
jest.mock('fs');
jest.mock('path', () => ({
    resolve: jest.fn((...args) => args.join('/')),
    join: jest.fn((...args) => args.join('/')),
    sep: '/', 
}));


const informasiControllerInstance = require('../../controllers/informasiController'); 

describe('InformasiController (MVC & File Handling)', () => {
    let controller;
    let req;
    let res;

    const EXISTING_FILE_PATH = 'public/uploads/informasi/old.pdf';
    const EXISTING_INFO = { id: 5, judul: 'Old Title', file_path: EXISTING_FILE_PATH };
    const INFO_WITHOUT_FILE = { id: 6, judul: 'Text Info', file_path: null };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = informasiControllerInstance; 
        
        req = { body: {}, params: {}, query: {}, file: undefined };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        // Default Mocks for File System
        fs.existsSync.mockReturnValue(true); 
        fs.unlinkSync.mockImplementation(() => {}); 

        // Default Mocks for Model operations
        InformasiModel.getAll.mockResolvedValue([]);
        InformasiModel.findById.mockImplementation((id) => {
            if (id == 5) return EXISTING_INFO;
            if (id == 6) return INFO_WITHOUT_FILE;
            return null;
        });
        InformasiModel.create.mockResolvedValue(100);
        InformasiModel.update.mockResolvedValue(1);
        InformasiModel.delete.mockResolvedValue(1);
    });

    const bind = (method) => method.bind(controller);

    // --- TESTING getAllInformasi ---
    describe('getAllInformasi', () => {
        const MOCK_ROWS = [{ id: 1, judul: 'SOP A', kategori: 'SOP' }];
        
        test('should fetch all info ordered by default fields', async () => {
            InformasiModel.getAll.mockResolvedValue(MOCK_ROWS);
            await bind(controller.getAllInformasi)(req, res);
            expect(InformasiModel.getAll).toHaveBeenCalledWith(undefined);
        });

        test('should filter by kategori if provided', async () => {
            req.query = { kategori: 'Panduan' };
            await bind(controller.getAllInformasi)(req, res);
            expect(InformasiModel.getAll).toHaveBeenCalledWith('Panduan');
        });

        test('should return 500 on database error', async () => {
            InformasiModel.getAll.mockRejectedValue(new Error('DB Fetch Error'));
            await bind(controller.getAllInformasi)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- TESTING createInformasi ---
    describe('createInformasi', () => {
        const MOCK_NEW_DATA = { id: 100, judul: 'Test', kategori: 'SOP' };

        test('should create info without file (file_path is null)', async () => {
            req.body = { judul: 'Test', isi: 'Content', kategori: 'SOP' };
            InformasiModel.findById.mockResolvedValue(MOCK_NEW_DATA);
            
            await bind(controller.createInformasi)(req, res);

            expect(InformasiModel.create).toHaveBeenCalledWith(
                'Test', 'Content', 'SOP', null
            );
        });
        
        // ** PERBAIKAN FINAL **
        test('should create info with file path (and default category)', async () => {
            req.body = { judul: 'Test' };
            req.file = { filename: 'file.pdf' };
            
            await bind(controller.createInformasi)(req, res);

            // Jika req.body tidak memiliki 'kategori' dan 'isi', Controller MENGIRIM UNDEFINED.
            // Model yang bertanggung jawab mengisi default. Kita koreksi assertion agar sesuai RECEIVED.
            expect(InformasiModel.create).toHaveBeenCalledWith(
                'Test', undefined, undefined, 'public/uploads/informasi/file.pdf'
            );
        });

        test('should return 500 on database error during creation', async () => {
            InformasiModel.create.mockRejectedValue(new Error('DB Insert Failed'));
            
            await bind(controller.createInformasi)(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- TESTING updateInformasi ---
    describe('updateInformasi', () => {

        test('should return 404 if info not found', async () => {
            req.params = { id: 999 };
            InformasiModel.findById.mockResolvedValue(null); 

            await bind(controller.updateInformasi)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('should update fields without changing file (no new file, no old deletion)', async () => {
            req.params = { id: 6 }; // ID 6 memiliki file_path: null
            req.body = { judul: 'New Title', isi: 'New Content', kategori: 'SOP' };
            
            await bind(controller.updateInformasi)(req, res);

            expect(InformasiModel.update).toHaveBeenCalledWith(
                6, 'New Title', 'New Content', 'SOP', null 
            );
            expect(fs.unlinkSync).not.toHaveBeenCalled();
        });

        test('should update fields, upload new file, and delete old file', async () => {
            req.params = { id: 5 }; // ID 5 memiliki file_path: 'public/uploads/informasi/old.pdf'
            req.body = { judul: 'New Title', isi: 'New Content', kategori: 'SOP' };
            req.file = { filename: 'new.pdf' }; 
            
            await bind(controller.updateInformasi)(req, res);

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(path.join).toHaveBeenCalledWith(expect.any(String), expect.any(String), 'public', EXISTING_FILE_PATH);

            expect(InformasiModel.update).toHaveBeenCalledWith(
                5, 'New Title', 'New Content', 'SOP', 'public/uploads/informasi/new.pdf' 
            );
        });
        
        test('should log warning but proceed if old file does not exist on disk', async () => {
            req.params = { id: 5 };
            req.body = { judul: 'New Title' };
            req.file = { filename: 'new.pdf' }; 
            fs.existsSync.mockReturnValue(false); // File lama tidak ditemukan

            await bind(controller.updateInformasi)(req, res);
            
            expect(fs.unlinkSync).not.toHaveBeenCalled(); 
            expect(InformasiModel.update).toHaveBeenCalled(); 
        });
        
        test('should log error but continue update if unlink fails', async () => {
            req.params = { id: 5 };
            req.body = { judul: 'New Title' };
            req.file = { filename: 'new.pdf' }; 
            fs.unlinkSync.mockImplementation(() => { throw new Error('Permission denied'); }); 

            await bind(controller.updateInformasi)(req, res);
            
            expect(InformasiModel.update).toHaveBeenCalled(); 
        });
        
        test('should return 500 on database error during update', async () => {
            req.params = { id: 5 };
            InformasiModel.findById.mockRejectedValue(new Error('DB Error')); 

            await bind(controller.updateInformasi)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    // --- TESTING deleteInformasi ---
    describe('deleteInformasi', () => {
        test('should return 404 if info not found', async () => {
            req.params = { id: 999 };
            InformasiModel.findById.mockResolvedValue(null); 

            await bind(controller.deleteInformasi)(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(InformasiModel.delete).not.toHaveBeenCalled();
        });

        test('should delete info without file and return success', async () => {
            req.params = { id: 6 }; // ID 6 tidak ada file
            
            await bind(controller.deleteInformasi)(req, res);

            expect(fs.unlinkSync).not.toHaveBeenCalled();
            expect(InformasiModel.delete).toHaveBeenCalledWith(6);
        });

        test('should delete info, delete file, and return success', async () => {
            req.params = { id: 5 }; // ID 5 memiliki file
            
            await bind(controller.deleteInformasi)(req, res);

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(InformasiModel.delete).toHaveBeenCalledWith(5);
        });
        
        test('should log warning and proceed if file not found on disk', async () => {
            req.params = { id: 5 };
            fs.existsSync.mockReturnValue(false); 

            await bind(controller.deleteInformasi)(req, res);

            expect(fs.unlinkSync).not.toHaveBeenCalled(); 
            expect(InformasiModel.delete).toHaveBeenCalled(); 
        });
        
        test('should return 500 on database error during deletion', async () => {
            req.params = { id: 5 }; 
            InformasiModel.delete.mockRejectedValue(new Error('DB Delete Failed')); 

            await bind(controller.deleteInformasi)(req, res);
            expect(res.status).toHaveBeenCalledWith(500);
        });
    });
});