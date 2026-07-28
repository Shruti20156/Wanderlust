const test = require('node:test');
const assert = require('node:assert/strict');
const { toLeafletCoordinates, buildPopupContent } = require('../utils/geocode');

test('converts GeoJSON coordinates to Leaflet coordinates', () => {
  assert.deepStrictEqual(toLeafletCoordinates([77.321, 19.1383]), [19.1383, 77.321]);
});

test('builds popup content using the listing title', () => {
  assert.equal(buildPopupContent('Cozy Cottage'), '<strong>Cozy Cottage</strong>');
});
