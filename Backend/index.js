//backend server entry
//connects firebase admin via db for backend database operations
import express from 'express';
import cors from 'cors';
import {db} from './config/firebaseAdmin.js';

const app = express();
const PORT = 5000;
app.use(cors());
app.use(express.json());

app.get('/test-firebase',async(requestAnimationFrame, res) =>{
    try {
     const snapshot = await db.collection('tasks').get();
    const tasks = snapshot.docs.map(doc => ({
        id: doc.data()
    }));
    res.json({tasks});
    
} catch (error) {
    res.status(500).json({error: error.message});
}
//start the backend server
app.listen(PORT, () => {
    console.log('Backened runningon http://localhost:${PORT}');
});
})