const express=require('express');
const router=express.Router();
const wrapAsync=require('../utils/wrapAsync');
const Listing=require('../models/listing');
const Review=require('../models/review');
const {listingSchema,ReviewSchema}=require('../schema');    
const ExpressError=require('../utils/ExpressError');
const listingcontroller=require("../controllers/listing");
const multer=require("multer");
const {storage}=require("../cloudConfig.js");
const upload=multer({storage});
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

const isLoggedIn = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
};

const isOwner = wrapAsync(async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
  if (!req.user || !listing.owner || !listing.owner.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to do that.');
    return res.redirect(`/listings/${id}`);
  }
  next();
});

router.route("/")
.get(wrapAsync(listingcontroller.index))
.post(upload.single('image'), validateListing, wrapAsync(listingcontroller.create));

//new route for creating new listing`
router.get('/new', (req, res) => {
  res.render('listings/new');
});

router.route("/:id")
.get(wrapAsync(listingcontroller.show))
.put(isLoggedIn, isOwner, upload.single('image'), validateListing, wrapAsync(listingcontroller.update))
.delete(isLoggedIn, isOwner, wrapAsync(listingcontroller.delete));


//show route for individual listing

//create route for new listing


//edit route for individual listing
router.get('/:id/edit', isLoggedIn, isOwner, wrapAsync(listingcontroller.edit));

//update route for individual listing


//delete route for individual listing




module.exports=router;