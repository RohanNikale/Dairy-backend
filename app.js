const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());


// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'build')));

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require('./routes/commentRoutes');
const followRoutes = require("./routes/followRoutes");
const likeRoutes = require("./routes/likeRoutes");
const notificationRoutes = require('./routes/notificationRoutes');

  
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follow', followRoutes);
app.use('/api/like', likeRoutes);
app.use('/api/notifications', notificationRoutes);
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

module.exports = app;