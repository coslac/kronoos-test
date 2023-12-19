import express from "express";
import cors from 'cors';
import fs from 'fs';
import parse from 'csv-parser';

const app = express();

app.use(cors({
    origin: '*'
}));

app.use(express.json());

app.get('/csv-converter', async (req, res) => {
    try {
        const objArray = [];
        fs.createReadStream("./arquivo.csv")
        .pipe(parse({ delimiter: ",", from_line: 2 }))
        .on("data", function (row) {
            objArray.push(row);
        })
        .on("error", function (error) {
            console.log(error.message);
        })
        .on("end", function () {
            console.log("finished");
            res.send(JSON.stringify(objArray));
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const port = process.env.PORT || "4000";

app.listen(port, () => {
  console.log(`Server Running at ${port} 🚀`);
});