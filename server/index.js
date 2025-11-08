const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRouter = require('./routes/api');

const path = require('path'); // Import path module

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'src' directory
app.use(express.static(path.join(__dirname, '../src')));

app.use('/api', apiRouter);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
