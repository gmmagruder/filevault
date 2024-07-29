// eslint-disable-line no-dupe-keys
process.env = {
    AZURE_STORAGE_ACCOUNT_NAME: 'test name',
    AZURE_STORAGE_ACCOUNT_KEY: 'test key',
    AZURE_STORAGE_ACCOUNT_NAME: 'testurl'
};

const handlers = require('./handlers');

jest.mock('@azure/storage-blob', () => ({
    ...jest.requireActual('@azure/storage-blob'),
    BlobServiceClient: jest.fn().mockImplementation(function () {
        return {
            getContainerClient: jest.fn().mockReturnValue({
                getBlockBlobClient: jest.fn().mockReturnValue({
                    uploadFile: jest.fn(),
                    delete: jest.fn()
                }),
          }),
        }
    })
}));

jest.mock('mysql2/promise', () => ({
    createConnection: jest.fn().mockImplementation(function () {
        return {
            query: jest.fn().mockReturnValue([{}]),
            end: jest.fn()
        }
    })
}));

jest.mock('fs', () => ({
    ...jest.requireActual('fs'),
    unlinkSync: jest.fn(),
}));

describe('Test endpoints', () => {
    it('getFiles fetches files successfully', async () => {
        const req = {}
        const res = {
            json: jest.fn()
        };

        await handlers.getFiles(req, res);

        expect(res.json).toHaveBeenCalled();
    })

    it('deleteFile fail to delete file', async () => {
        const req = {params: {key: 1}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };

        jest.spyOn(res, 'status').mockImplementationOnce(function () {
            throw new Error("error");
        })
        
        await handlers.deleteFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });

    it('deleteFile successfully', async () => {
        const req = {params: {key: 1}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.deleteFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('uploadFile successfully', async () => {
        const req = {body: {note: 'test'}, file: {filename: 'test filename', path: 'test path'}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
    });

    it('uploadFile with no file name', async () => {
        const req = {body: {note: null}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('uploadFile with file name but no file', async () => {
        const req = {body: {note: 'test'}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    it('uploadFile fail to upload file', async () => {
        const req = {body: {note: "test"}, file: true}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };

        jest.spyOn(res, 'status').mockImplementationOnce(function () {
            throw new Error("error");
        })
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
  });