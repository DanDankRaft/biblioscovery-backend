import cors from 'cors';
import express from 'express';
import redis from 'redis';
import chalk from 'chalk';
import os from 'os';
import 'dotenv/config';

function inMode(mode)
{
    return process.argv.includes(mode);
}


const app = express();
const port = 3000;
let addr;
if(inMode('dev'))
    addr = os.networkInterfaces()['Wi-Fi'][1].address;
else
    addr = '';

//this middleware allows any device to connect to the database and retreive any response
app.use(cors());

//this middleware, which is only activated if the 'log-connections' option is present, prints any request we receive
if(inMode('log-connections'))
{
    app.use(connectionLog);
    const connectionLog = (req, res, next) => {console.log(`received request from: ${req.ip}`); next();};
}

//establishing connection to the redis database
let db = redis.createClient({url: process.env.DATABASE_URL, password: process.env.DATABASE_PASSWORD, username: process.env.DATABASE_USERNAME});
await db.connect();

//the search query!
app.get('/search', async (req, res) => {
    if (!req.query.q)
    {
        console.log("no query inputted!");
        res.status(400);
        return;
    }

    //TODO - add escape sequences to all data

    //we need to add escape sequences to all punctuation
    let formattedQuery = req.query.q.replace(/([\,\.\<\>\{\}\[\]\"\'\:\;\!\@\#\$\%\^\&\*\(\)\-\+\=\~])/, "\\$1");
    //send response from datbase:
    try
    {
        let output = await db.ft.search("idx:documents", `${req.query.q}`);
        let responses = output.documents.map((result, index) => result.value);

        res.status(200).json(responses);
    }
    catch(e)
    {
        console.log(chalk.red(`error! ${e.message}`))
        res.status(400);
    }

});

app.listen(port, addr, () => {
    console.log(`running on http://${addr}:${port}`);
    if(process.argv[2])
        console.log(`in ${chalk.yellow(process.argv[2])} mode`);
});