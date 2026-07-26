//reviews routes
const express = require('express');
const router = express.Router({ mergeParams: true });
const wrapAsync = require('../utils/wrapAsync');
const Listing = require('../models/listing');
const Review = require('../models/review');
const { ReviewSchema } = require('../schema');
const ExpressError = require('../utils/ExpressError');
const reviewcontroller=require("../controllers/review");
const validateReview = (req, res, next) => {
  const { error } = ReviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.details[0].message, 400);
  }
  next();
};

const isLoggedIn = (req, res, next) => {
  if (!req.user) {
    req.flash('error', 'You must be signed in to leave a review.');
    return res.redirect('/login');
  }
  next();
};

const isReviewAuthor = wrapAsync(async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  const listing = await Listing.findById(id);
  if (!review || !listing) {
    req.flash('error', 'Review or listing not found.');
    return res.redirect(`/listings/${id}`);
  }

  const isAuthor = review.author && review.author.equals(req.user._id);
  const isListingOwner = listing.owner && listing.owner.equals(req.user._id);

  if (!isAuthor && !isListingOwner) {
    req.flash('error', 'You do not have permission to delete this review.');
    return res.redirect(`/listings/${id}`);
  }
  next();
});

// reviews routes (mounted at /listings/:id/reviews)
router.post('/', isLoggedIn, validateReview, wrapAsync(reviewcontroller.create));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviewcontroller.delete));
module.exports = router;