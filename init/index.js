const mongoose = require('mongoose');
const Listing = require('../models/listing');
const data=require('./data.js');

const dbURI = 'mongodb://localhost:27017/mydatabase';

main()
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((err) => {
    console.error('Error connecting to MongoDB:', err);
});

async function main() {
    await mongoose.connect(dbURI); 
}
const initDb=async () => {
    await Listing.deleteMany({}); // Clear existing listings
    await Listing.insertMany(data);
    console.log('Database initialized with sample data');
};
initDb();