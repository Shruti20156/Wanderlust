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
const { listingSchema, ReviewSchema } = require('./schema');
const Review = require('./models/review');
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

const validateListing = (req, res, next) => {
  const { error } = listingSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};


const validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

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
    const listing = await Listing.findById(req.params.id).populate('reviews');
    res.render('listings/show', { listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
//create route for new listing
app.post('/listings', validateListing, wrapAsync(async (req, res) => {
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
app.put('/listings/:id', validateListing, wrapAsync(async (req, res) => {
  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.redirect(`/listings/${updatedListing._id}`);
}));

//delete route for individual listing
app.delete('/listings/:id', wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  res.redirect('/listings');
}));

//reviews routes
app.post('/listings/:id/reviews', validateReview, wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const { rating, comment } = req.body;
  const newReview = new Review({ rating, comment });
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  res.redirect(`/listings/${id}`);
}));

app.use((err, req, res, next) => {
  let{statusCode , message} = err;
  res.render('error', {statusCode, message});
  // res.status(statusCode || 500).send(message || 'Something went wrong');
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});