// tests/utils/uploadUtils.test.js

// 1. Mock Dependencies (di tingkat atas file)
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');

// FIX: Ganti modul path dan fs dengan MOCK
jest.mock('path');
jest.mock('fs');
jest.mock('xlsx');

// --- Mock Multer yang Benar ---
const mockMulter = jest.fn((options) => {
    return {
        single: jest.fn(),
        array: jest.fn(),
        any: jest.fn(),
        fileFilter: options.fileFilter,
        limits: options.limits,
    };
});
mockMulter.diskStorage = jest.fn((options) => options);

jest.mock('multer', () => mockMulter);
// -----------------------------

// Import file yang diuji HANYA setelah semua Mock di atas di-define
const uploadUtils = require('../../utils/uploadUtils'); 
// *******************************************************************


describe('uploadUtils', () => {
    
    let multerOptions; 
    let storageOptions; 
    const EXPECTED_UPLOAD_DIR = '/mock/root/uploads'; 
    
    // --- Setup Data & Mocks ---
    const MOCK_FILE = { originalname: 'test.xlsx' };
    const MOCK_CSV_DATA = 'kode,nama,status\nK001,Laptop,Tersedia\nK002,Mouse,Rusak\n';
    
    beforeAll(() => {
        // FIX: Pastikan path.join & process.cwd di-mock untuk menghasilkan EXPECTED_UPLOAD_DIR
        path.join.mockImplementation((...args) => args.join('/'));
        process.cwd = jest.fn(() => '/mock/root');

        path.extname.mockImplementation((filename) => {
            const ext = filename.split('.').pop();
            return `.${ext}`;
        });
        
        global.console.error = jest.fn();
        
        // Tangkap options Multer dan Storage (Hanya dipanggil sekali saat require)
        if (mockMulter.mock.calls.length > 0) {
            multerOptions = mockMulter.mock.calls[0][0];
        }
        if (mockMulter.diskStorage.mock.calls.length > 0) {
            storageOptions = mockMulter.diskStorage.mock.calls[0][0];
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset fs mock
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockImplementation(() => {});
        fs.unlinkSync.mockImplementation(() => {}); 
        
        // FIX: Pastikan Date.now() di-restore sebelum test yang membutuhkannya
        if (jest.isMockFunction(Date.now)) {
            Date.now.mockRestore();
        }
    });

    // --- TESTING FILE CLEANUP (exports.cleanupFile) ---
    describe('cleanupFile', () => {
        test('should call fs.unlinkSync if file exists', () => {
            fs.existsSync.mockReturnValue(true);
            uploadUtils.cleanupFile('/mock/path/file.pdf');

            expect(fs.existsSync).toHaveBeenCalledWith('/mock/path/file.pdf');
            expect(fs.unlinkSync).toHaveBeenCalledWith('/mock/path/file.pdf');
        });

        test('should not call fs.unlinkSync if file does not exist', () => {
            fs.existsSync.mockReturnValue(false);
            uploadUtils.cleanupFile('/mock/path/nonexistent.pdf');

            expect(fs.existsSync).toHaveBeenCalled();
            expect(fs.unlinkSync).not.toHaveBeenCalled();
        });

        test('should log error if fs.unlinkSync fails', () => {
            fs.existsSync.mockReturnValue(true);
            fs.unlinkSync.mockImplementationOnce(() => { 
                throw new Error('Permission denied');
            });

            uploadUtils.cleanupFile('/mock/path/file.pdf');

            expect(fs.unlinkSync).toHaveBeenCalled();
            expect(global.console.error).toHaveBeenCalledWith('Error deleting file:', expect.any(Error));
        });
    });
    
    // --- TESTING MULTER CONFIGURATION (exports.upload & storage) ---
    describe('Multer Configuration', () => {
        
        test('should check if uploadDir exists, if not, create it', () => {
            jest.isolateModules(() => {
                fs.existsSync.mockReturnValueOnce(false); 
                require('../../utils/uploadUtils');
            });
            expect(fs.existsSync).toHaveBeenCalledWith(EXPECTED_UPLOAD_DIR);
            expect(fs.mkdirSync).toHaveBeenCalledWith(EXPECTED_UPLOAD_DIR, { recursive: true });
        });
        
        test('should filter allowed file types (.xlsx, .csv, .xls)', () => {
            const filterFn = multerOptions.fileFilter; 
            let mockCb = jest.fn();

            // Test case 1: Allowed (.xlsx)
            filterFn({}, { originalname: 'data.xlsx' }, mockCb);
            expect(mockCb).toHaveBeenCalledWith(null, true);
        });
        
        // FIX 1: Tes untuk destination
        test('storage configuration calls cb with uploadDir', () => {
            const mockCb = jest.fn();
            
            // Panggil destination function
            storageOptions.destination(null, null, mockCb);
            expect(mockCb).toHaveBeenCalledWith(null, EXPECTED_UPLOAD_DIR);
        });
        
        // FIX 2: Tes untuk filename (memastikan Date.now() di-mock dengan benar)
        test('storage configuration generates filename with timestamp and extension', () => {
            const mockCb = jest.fn();
            const mockDate = 1678886400000;
            
            // FIX: Gunakan spyOn(Date, 'now') untuk mengontrol Date.now()
            jest.spyOn(Date, 'now').mockReturnValue(mockDate);
            
            // Panggil filename function
            storageOptions.filename(null, { originalname: 'data.csv' }, mockCb);
            
            expect(mockCb).toHaveBeenCalledWith(null, 'bulk-1678886400000.csv');
            
            // Restore Date.now() setelah selesai
            Date.now.mockRestore();
        });
    });

    // --- TESTING FILE PARSING (exports.parseUploadedFile) ---
    describe('parseUploadedFile', () => {
        const mockFilePath = '/mock/path/data.file';

        // --- CSV Parsing Tests ---
        test('should parse CSV correctly and map headers/values', () => {
            path.extname.mockReturnValue('.csv');
            fs.readFileSync.mockReturnValue(MOCK_CSV_DATA);

            const result = uploadUtils.parseUploadedFile(mockFilePath, MOCK_FILE.originalname);

            expect(fs.readFileSync).toHaveBeenCalledWith(mockFilePath, 'utf-8');
            expect(result).toEqual([
                { kode: 'K001', nama: 'Laptop', status: 'Tersedia' },
                { kode: 'K002', nama: 'Mouse', status: 'Rusak' },
            ]);
        });
        
        test('should throw error if CSV file contains only header', () => {
            path.extname.mockReturnValue('.csv');
            fs.readFileSync.mockReturnValue('header1,header2'); 

            expect(() => {
                uploadUtils.parseUploadedFile(mockFilePath, MOCK_FILE.originalname);
            }).toThrow('File CSV harus memiliki header dan minimal 1 baris data.');
        });
        
        test('should skip empty rows in CSV', () => {
            path.extname.mockReturnValue('.csv');
            const emptyRowData = 'h1,h2\nval1,val2\n,,\nval3,val4\n'; 
            fs.readFileSync.mockReturnValue(emptyRowData);

            const result = uploadUtils.parseUploadedFile(mockFilePath, MOCK_FILE.originalname);

            expect(result.length).toBe(2);
            expect(result).toEqual([
                { h1: 'val1', h2: 'val2' },
                { h1: 'val3', h2: 'val4' },
            ]);
        });


        // --- Excel Parsing Tests ---
        test('should use xlsx.utils.sheet_to_json for Excel files (.xlsx)', () => {
            path.extname.mockReturnValue('.xlsx');
            
            const mockWorkbook = {
                SheetNames: ['Sheet1'],
                Sheets: { 'Sheet1': 'worksheet_data' }
            };
            xlsx.readFile.mockReturnValue(mockWorkbook);
            xlsx.utils.sheet_to_json.mockReturnValue(['mocked json data']);

            const result = uploadUtils.parseUploadedFile(mockFilePath, MOCK_FILE.originalname);

            expect(xlsx.readFile).toHaveBeenCalledWith(mockFilePath);
            expect(xlsx.utils.sheet_to_json).toHaveBeenCalledWith('worksheet_data');
            expect(result).toEqual(['mocked json data']);
        });
        
        test('should handle .xls file extension for Excel parsing', () => {
            path.extname.mockReturnValue('.xls');
            
            const mockWorkbook = { SheetNames: ['Sheet1'], Sheets: { 'Sheet1': 'data' } };
            xlsx.readFile.mockReturnValue(mockWorkbook);
            xlsx.utils.sheet_to_json.mockReturnValue(['mocked json data']);

            uploadUtils.parseUploadedFile(mockFilePath, MOCK_FILE.originalname);

            expect(xlsx.readFile).toHaveBeenCalledWith(mockFilePath);
        });
    });

});