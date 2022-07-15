const express = require('express');
const app = express();
const port = 5000;
const userRouter = require('./routes/userRouter');
const mongoose = require('mongoose');
const connectionString = 'mongodb+srv://wenzema:1b9hZQx6XZudvROh@cluster0.2etmi04.mongodb.net/GameOnStarDatabase?retryWrites=true&w=majority';

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Game On Star is listening on port ${port}`)
})

const options = {
    keepAlive: true,
    connectTimeoutMS: 30000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

mongoose.connect(connectionString, options, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Successfully connected to MongoDB.");
    }
});

app.use('/users', userRouter);
