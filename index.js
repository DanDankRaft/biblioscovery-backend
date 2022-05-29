import cors from 'cors';
import express from 'express';
import redis from 'redis';

const app = express();
const port = 3000;

app.use(cors());

var db = redis.createClient({url: process.env.DATABASE_URL});
await db.connect();

app.get('/search', async (req, res) => {
    res.status(200);
    if (!req.query.q)
    {
        res.json([{ title: "NO DATA YET!" }]);
        return;
    }

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

app.listen(port, () => {
    console.log(`running on http://localhost:${port}`);
});