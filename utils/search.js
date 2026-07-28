function filterListingsByQuery(listings, query) {
  const normalizedQuery = String(query || '').trim().toLowerCase();

  if (!normalizedQuery) {
    return listings;
  }

  return listings.filter((listing) => {
    const haystack = [
      listing.title,
      listing.location,
      listing.country,
      listing.description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}

module.exports = {
  filterListingsByQuery,
};
