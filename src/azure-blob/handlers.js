const mysql = require('mysql2/promise');
const fs = require('fs');

const { BlobServiceClient, StorageSharedKeyCredential } = require('@azure/storage-blob');

const sharedKeyCredential = new StorageSharedKeyCredential(
    process.env.AZURE_STORAGE_ACCOUNT_NAME,
    process.env.AZURE_STORAGE_ACCOUNT_KEY
);

const blobServiceClient = new BlobServiceClient(
    `https://${process.env.AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
    sharedKeyCredential
);

const containerClient = blobServiceClient.getContainerClient(process.env.AZURE_CONTAINER_NAME);

async function uploadFile(req, res) {
    const fileName = req.body.note;
    if (!fileName) {
        return res.status(400).send('File name is required.');
    }

    if (req.file) {
        try {
            const connection = await mysql.createConnection({
                host: process.env.DATABASE_HOST,
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                port: process.env.DATABASE_PORT,
                database: process.env.DATABASE_NAME,
            });

            const blobName = req.file.filename;
            const blockBlobClient = containerClient.getBlockBlobClient(blobName);

            await blockBlobClient.uploadFile(req.file.path);
            fs.unlinkSync(req.file.path); // remove the file locally after upload

            connection.query('INSERT INTO file (name, fileKey) VALUES (?,?)', [fileName, blobName]);
            connection.end();

            res.status(200).send('File uploaded successfully.');
        } catch (err) {
            console.error('Error uploading file:', err);
            res.status(500).send('Failed to upload file.');
        }
    } else {
        res.status(400).send('No file uploaded.');
    }
}

async function getFiles(req, res) {
    const connection = await mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
        database: process.env.DATABASE_NAME,
    });

    const results  = await connection.query('SELECT * FROM file');
    res.json(results[0]);
    connection.end();
}

async function deleteFile(req, res) {
    const fileKey = req.params.key;

    try {
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            port: process.env.DATABASE_PORT,
            database: process.env.DATABASE_NAME,
        });

        const blockBlobClient = containerClient.getBlockBlobClient(fileKey);
        await blockBlobClient.delete();

        connection.query('DELETE FROM file WHERE fileKey = ?', [fileKey]);
        connection.end();

        res.status(200).send('File deleted successfully.');
    } catch (err) {
        console.error('Error deleting file:', err);
        res.status(500).send('Failed to delete file.');
    }
}

module.exports = {
    uploadFile,
    getFiles,
    deleteFile
};