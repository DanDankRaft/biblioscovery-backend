import cors from 'cors';
import express from 'express';
import redis from 'redis';
import chalk from 'chalk';

const app = express();
const port = 3000;
const addr = '192.168.50.37';

const connectionLog = (req, res, next) => {console.log(`received request from: ${req.ip}`); next();};

app.use(cors());
if(process.argv[2] == 'log-connections')
    app.use(connectionLog);

var db = redis.createClient({url: process.env.DATABASE_URL});
await db.connect();

app.get('/search', async (req, res) => {
    if (!req.query.q)
    {
        console.log("redirecting!");
        return;
    }
    res.status(200);
        //send response from datbase:
        let output = await db.sMembers("documents");
        var responses = [];
        output.forEach((value, index) => {
            if(value.toUpperCase().includes(req.query["q"].toUpperCase()))
            {
                responses.push({title: value});
            }
        });
        res.json(responses);

});

app.listen(port, addr, () => {
    console.log(`running on http://${addr}:${port}`);
    if(process.argv[2])
        console.log(`in ${chalk.yellow(process.argv[2])} mode`);
});