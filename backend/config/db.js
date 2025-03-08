const mysql = require("mysql2");
const mongoose = require("mongoose");
require("dotenv").config();

// MySQL Connection
const sqlPool = mysql.createPool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DATABASE
}).promise();

// MongoDB Connection
const connectMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { 
            useNewUrlParser: true, 
            useUnifiedTopology: true 
        });
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = { sqlPool, connectMongoDB };
