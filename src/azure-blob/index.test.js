const express = require('express');
const handlers = require('./handlers');

jest.mock('@azure/storage-blob');

describe('Test endpoints', () => {
    const app = express();

    it('/upload with no file', async () => {
        const req = {body: {note: null}}
        const res = {
            status: jest.fn().mockImplementation(function () {
                return {send: jest.fn()}
            }),
        };
        
        await handlers.uploadFile(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
  });