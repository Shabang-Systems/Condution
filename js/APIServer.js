const port = 32445;

const express = require('express');
const app = express();

app.get('/', (req, res) => {
	res.end('See https://github.com/Shabang-Systems/Condution/wiki/Localhost-API for more information.');
});

app.post('/', (req, res) => {
	let data = '';
	req.on('data', chunk => data += chunk);
	req.on('end', () => {
		// TODO: check if it's a valid FirebaseManager function
	});
});

app.listen(port, () => { console.log(`API Server listening on port ${port}`); });

