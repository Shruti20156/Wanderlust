const express = require('express');
const app = express();
const port = 3000;
const mongoose = require('mongoose');
const Listing = require('./models/listing');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const { listingSchema } = require('./schema');
app.engine('ejs', ejsMate);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
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

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.get('/listings', wrapAsync(async (req, res) => {
  try {
    const listings = await Listing.find();
    res.render('listings/index', { listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));

app.get('/listings/new', (req, res) => {
  res.render('listings/new');
});
//show route for individual listing
app.get('/listings/:id', wrapAsync(async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    res.render('listings/show', { listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
//create route for new listing
app.post('/listings', wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body);
  await newListing.save();
  res.redirect('/listings');
}));
//edit route for individual listing
app.get('/listings/:id/edit', wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render('listings/edit', { listing });
}));

//update route for individual listing
app.put('/listings/:id', wrapAsync(async (req, res) => {
  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.redirect(`/listings/${updatedListing._id}`);
}));

//delete route for individual listing
app.delete('/listings/:id', wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect('/listings');
}));
app.use((err, req, res, next) => {
  let{statusCode , message} = err;
  res.render('error', {statusCode, message});
  // res.status(statusCode || 500).send(message || 'Something went wrong');
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});