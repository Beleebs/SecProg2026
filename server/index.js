import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/message', (req, res) => {
    console.log(`Received request from user`);
    res.json({ message: "Hello from the Express backend!" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
