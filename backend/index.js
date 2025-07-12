const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/ping', (req, res) => {
    res.json({ status: 'healthy' });
});

app.listen(3000, () => {
    console.log('Server is listening on port 3000');
});