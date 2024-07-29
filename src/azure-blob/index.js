const express = require('express');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const handlers = require('./handlers');

const app = express();
const PORT = process.env.PORT || 3000;

const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/upload', upload.single('file'), handlers.uploadFile);

app.get('/files', handlers.getFiles);

app.delete('/files/:key', handlers.deleteFile);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
