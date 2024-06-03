const dotenv = require('dotenv');
dotenv.config({ path: './config/config.env' });

require('./config/database');

const app = require('./app');

const port = 5000;

app.listen(port, (error) => {
    if (!error) {
        console.log(`Server is running at http://localhost:${port}`);
    }
    else {
        console.log('Error: ' + error);
    }
});