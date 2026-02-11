import express from 'express';
import cors from 'cors';
import serviceRoutes from './routes/services.routes.js'
import messageRoutes from "./routes/message.routes.js"
import aiRoutes from './routes/ai.routes.js'
import generatedRoutes from './routes/generated.routes.js'
const app = express();
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

//middleware

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error("CORS origin not allowed"));
    }
}));
app.use(express.static('public'));
app.use(express.json());
app.use('/ai',aiRoutes);

// Routes 
app.use('/services', serviceRoutes)
app.use('/generated/:serviceId', generatedRoutes);
app.use('/:serviceId', messageRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Bob the builder is up and running"})
});

export default app;
