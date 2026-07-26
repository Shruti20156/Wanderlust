const Listing=require("../models/listing");
module.exports.index=async (req, res) => {
  try {
    const listings = await Listing.find();
    res.render('listings/index', { listings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
module.exports.show=async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate({ path: 'reviews', populate: { path: 'author', select: 'username' } })
      .populate({ path: 'owner', select: 'username' });

    if (!listing) {
      req.flash('error', 'Listing not found!');
      return res.redirect('/listings');
    }
    res.render('listings/show', { listing });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.create=async (req, res) => {
  if (!req.user) {
    req.flash('error', 'Please login to create a listing.');
    return res.redirect('/login');
  }

  const imageUrl = req.file?.path || req.file?.secure_url || req.body.image || req.body['listing[image]'];
  const imageData = imageUrl
    ? { url: imageUrl, filename: req.file?.filename || 'uploaded-image' }
    : undefined;

  const listingData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
    image: imageData,
    owner: req.user._id,
  };

  const newListing = new Listing(listingData);

  await newListing.save();
  req.flash('success', 'Successfully created a new listing!');
  res.redirect('/listings');
};


module.exports.edit=async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  res.render('listings/edit', { listing });
};

module.exports.update=async (req, res) => {
  const updateData = {
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    location: req.body.location,
    country: req.body.country,
  };
  if (req.file?.path || req.file?.secure_url) {
    updateData.image = {
      url: req.file.path || req.file.secure_url,
      filename: req.file.filename || 'uploaded-image',
    };
  }

  const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!updatedListing) {
    req.flash('error', 'Listing not found!');
    return res.redirect('/listings');
  }
  req.flash('success', 'Successfully updated the listing!');
  res.redirect(`/listings/${updatedListing._id}`);
};

module.exports.delete=async (req, res) => {
  await Listing.findByIdAndDelete(req.params.id);
  req.flash('success', 'Successfully deleted the listing!');
  res.redirect('/listings');
};