const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.create=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const { rating, comment } = req.body;
  const newReview = new Review({ rating, comment, author: req.user._id });
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  req.flash('success', 'Successfully added a new review!');
  res.redirect(`/listings/${listing._id}`);
};
module.exports.delete=async (req, res) => {
  const { id, reviewId } = req.params;
  await Review.findByIdAndDelete(reviewId);
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash('success', 'Successfully deleted the review!');
  res.redirect(`/listings/${id}`);
};