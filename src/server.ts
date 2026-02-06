import app from "./app.js";
import dotenv from 'dotenv';
import { testDbConnection } from "./db/index.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async ()=> {
    await testDbConnection();


// Start Listening

app.listen(PORT, () => {
    console.log(`\n Server running on http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/`)
});

};

startServer();