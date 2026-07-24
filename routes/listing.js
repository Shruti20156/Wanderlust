const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync');
const Listing=require('../models/listing');
const Review=require('../models/review');
const {listingSchema,ReviewSchema}=require('../schema');    
const ExpressError=require('../utils/ExpressError');

const validateListing=(req,res,next)=>{
  const {error}=listingSchema.validate(req.body);
  if(error){
    throw new ExpressError(error.details[0].message, 400);
  }
  next();
};

const validateReview=(req,res,next)=>{
  const {error}=ReviewSchema.validate(req.body);
  if(error){
    throw new ExpressError(error.details[0].message, 400);
  }
  next();
};

router.get('/', wrapAsync(async (req, res) => {
  try {
    const listings = await Listing.find();
    res.render('listings/index', { listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
//new route for creating new listing`
router.get('/new', (req, res) => {
  res.render('listings/new');
});
//show route for individual listing
router.get('/:id', wrapAsync(async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('reviews');
    if (!listing) {
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }
    res.render('listings/show', { listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}));
//create route for new listing
router.post('/', validateListing, wrapAsync(async (req, res) => {
  const newListing = new Listing(req.body);
  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
}));
//edit route for individual listing
router.get('/:id/edit', wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render('listings/edit', { listing });
}));

//update route for individual listing
router.put('/:id', validateListing, wrapAsync(async (req, res) => {
  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!updatedListing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
    req.flash('success', 'Successfully updated the listing!');
  res.redirect(`/listings/${updatedListing._id}`);
}));

//delete route for individual listing
router.delete('/:id', wrapAsync(async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted the listing!');
  res.redirect('/listings');
}));



module.exports=router;