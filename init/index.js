const mongoose = require('mongoose');
const Listing = require('../models/listing');
const User = require('../models/user');
const data = require('./data.js');

const dbURI = 'mongodb://localhost:27017/mydatabase';

async function main() {
    await mongoose.connect(dbURI);
    console.log('Connected to MongoDB');
    await initDb();
}

const initDb = async () => {
   

    const user = await User.findOne();
    const listingsToInsert = data.map((obj) => {
        const listing = { ...obj };
        if (user) {
            listing.owner = user._id;
        }
        return listing;
    });

    await Listing.insertMany(listingsToInsert);
    console.log('Database initialized with sample data');
};

main().catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});