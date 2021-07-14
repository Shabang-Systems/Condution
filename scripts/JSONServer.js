/**
 * This is a reference JSONProvider Companion
 * server. If you want to implement a single-user
 * JSON fileserver, or just want to host a scrappy
 * JSONProvider, this is your reference.
 *
 * IT IS A RATHER SILLY IDEA TO EXPOSE THIS SERVER TO 
 * THE WIDER INTERNET! Host a Condution gui instance
 * in the same machine and expose that. Help us, help 
 * you.
 */

DBPath = "./demodata.json"
const port = 18230

const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser');
var cors = require('cors')
const app = express()

// Add headers
app.use(cors());

app.use(bodyParser.json());

app.get('/meta', (_, res) => {
    res.json({"version": "1.1.0", "consumable": "0"})
});

app.get('/', (_, res) => {
    console.log(`GET on / on ${new Date()}`)
    res.json(JSON.parse(fs.readFileSync(DBPath)))
});

app.post('/', (req, res) => {
    console.log(`POST on / on ${new Date()}`)
    fs.writeFileSync(DBPath, JSON.stringify(req.body));
    res.json({"result":"success"})
});


app.listen(port, () => {
    console.log(`Sample JSON server listening at http://localhost:${port}`)
})


