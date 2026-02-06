import express from 'express';
import cors from 'cors';

const app = express();

//middleware

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Bob the builder is up and running"})
});

export default app;