import cors from 'cors';
import express from 'express';
import redis from 'redis';
import chalk from 'chalk';
import 'dotenv/config';

const app = express();
const port = 3000;
const addr = '192.168.50.37';

//this middleware allows any device to connect to the database and retreive any response
app.use(cors());

//this middleware, which is only activated if the 'log-connections' option is present, prints any request we receive
if(process.argv.includes('log-connections'))
{
    app.use(connectionLog);
    const connectionLog = (req, res, next) => {console.log(`received request from: ${req.ip}`); next();};
}

//establishing connection to the redis database
let db = redis.createClient({url: process.env.DATABASE_URL, password: "UGm9UzAJjDYrImBZVaPzNf0TkNYM7tUm"});
await db.connect();

//the search query!
app.get('/search', async (req, res) => {
    if (!req.query.q)
    {
        console.log("no query inputted!");
        return;
    }
    res.status(200);
    
    //send response from datbase:
    // let output = await db.sendCommand["FT.SEARCH", 'dix:documents', `\"${req.query.q}\"`];
    let output = await db.ft.search("idx:documents", `${req.query.q}`);
    let responses = output.documents.map((result, index) => result.value);

    res.json(responses);

});

app.listen(port, addr, () => {
    console.log(`running on http://${addr}:${port}`);
    if(process.argv[2])
        console.log(`in ${chalk.yellow(process.argv[2])} mode`);
});