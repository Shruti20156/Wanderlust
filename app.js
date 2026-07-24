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
const listings = require('./routes/listing');
const reviewRoutes = require('./routes/review');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/user');

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

const sessionOptions = {
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());//middleware to initialize passport
app.use(passport.session());//middleware to use passport sessions
passport.use(new localStrategy(User.authenticate()));//use the authenticate method from passport-local-mongoose to handle authentication
passport.serializeUser(User.serializeUser());//serialize user into the session
passport.deserializeUser(User.deserializeUser());//deserialize user from the session

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.get('/', (req, res) => {
  res.send('Hello, World!');
});
app.use((req, res, next) => {
  const successMsgs = req.flash('success');
  const errorMsgs = req.flash('error');
  res.locals.success = successMsgs && successMsgs.length ? successMsgs[0] : null;
  res.locals.error = errorMsgs && errorMsgs.length ? errorMsgs[0] : null;
  next();
});

app.use('/', userRoutes);
app.use('/listings', listings);
app.use('/listings/:id/reviews', reviewRoutes);

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


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Something went wrong';
  res.status(statusCode).render('error', { statusCode, message });
});
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
