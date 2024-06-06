const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('setup is ready');
})

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require("./routes/followRoutes");
const likeRoutes = require("./routes/likeRoutes");
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/like', likeRoutes);

module.exports = app;