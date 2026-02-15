const app = require('../src/app');
const connectDB = require('../src/config/db');

module.exports = async (req, res) => {
    await connectDB();
    app(req, res);
};
