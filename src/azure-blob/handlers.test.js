const express = require('express');
const handlers = require('./handlers');

jest.mock('@azure/storage-blob');
jest.mock('mysql2/promise', () => ({
    createConnection: jest.fn().mockImplementation(function () {
        return {
            query: jest.fn().mockReturnValue([{}]),
            end: jest.fn()
        }
    })
}));

describe('Test endpoints', () => {
    const app = express();

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
        const req = {body: {note: null}, file: true}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });

    // it('/upload successfully', async () => {
    //     const req = {body: {note: null}, file: true}
    //     const res = {
    //         status: jest.fn().mockImplementation(function () {
    //             return {send: jest.fn()}
    //         }),
    //     };

    //     const mockQuery = jest.fn()
    //     jest.mock('mysql2/promise', () => ({
    //         createConnection: () => ({ 
    //             connect: () => undefined,
    //             query: mockQuery
    //         }),
    //     }))
        
    //     await handlers.uploadFile(req, res);
    //     expect(res.status).toHaveBeenCalledWith(200);
    // });

    it('getFiles fetches files successfully', async () => {
        const req = {}
        const res = {
            json: jest.fn()
        };

        await handlers.getFiles(req, res);

        expect(res.json).toHaveBeenCalled();
    })
  });