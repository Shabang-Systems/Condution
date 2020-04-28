const port = 32445;

const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.end('See https://github.com/Shabang-Systems/Condution/wiki/Localhost-API for more information.');
});

app.listen(port, () => { console.log(`API Server listening on port ${port}`); });

