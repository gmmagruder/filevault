const mysql = require('mysql2/promise');
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const handlers = require('./handlers');

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_KEY
);

const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
);

const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/upload', upload.single('file'), handlers.uploadFile);

app.get('/files', handlers.getFiles);

app.delete('/files/:key', handlers.deleteFile);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
