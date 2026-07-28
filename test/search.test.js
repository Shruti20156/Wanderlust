const test = require('node:test');
const assert = require('node:assert/strict');
const { filterListingsByQuery } = require('../utils/search');

test('filters listings by title, location, or country', () => {
  const listings = [
    { title: 'Cozy Cottage', location: 'Manali', country: 'India' },
    { title: 'Beach Villa', location: 'Goa', country: 'India' },
    { title: 'Mountain Cabin', location: 'Shimla', country: 'India' },
  ];

  const result = filterListingsByQuery(listings, 'goa');

  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Beach Villa');
});
