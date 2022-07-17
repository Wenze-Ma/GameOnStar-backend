const express = require('express');
const app = express();
const port = 5000;
const userRouter = require('./routes/userRouter');
const mongoose = require('mongoose');
const connectionString = 'mongodb+srv://wenzema:1b9hZQx6XZudvROh@cluster0.2etmi04.mongodb.net/GameOnStarDatabase?retryWrites=true&w=majority';
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');


app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => {
    console.log(`Game On Star is listening on port ${port}`)
})

app.use(cookieParser());

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
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/users', userRouter);
