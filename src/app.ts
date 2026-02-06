import express from 'express';
import cors from 'cors';
import serviceRoutes from './routes/services.routes.js'


const app = express();

//middleware

app.use(cors());
app.use(express.json());

// Routes 
app.use('/services', serviceRoutes)

app.get("/", (req, res) => {
    res.json({ message: "Bob the builder is up and running"})
});

export default app;