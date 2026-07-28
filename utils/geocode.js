const https = require('https');

function geocodeLocation(location) {
  return new Promise((resolve, reject) => {
    if (!location || typeof location !== 'string' || !location.trim()) {
      resolve(null);
      return;
    }

    const query = encodeURIComponent(location.trim());
    const options = {
      hostname: 'nominatim.openstreetmap.org',
      path: `/search?format=jsonv2&limit=1&q=${query}`,
      headers: {
        'User-Agent': 'wanderlust-app/1.0',
      },
    };

    const request = https.get(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (!Array.isArray(parsed) || parsed.length === 0) {
            resolve(null);
            return;
          }

          const result = parsed[0];
          const longitude = parseFloat(result.lon);
          const latitude = parseFloat(result.lat);

          if (Number.isNaN(longitude) || Number.isNaN(latitude)) {
            resolve(null);
            return;
          }

          resolve([longitude, latitude]);
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on('error', reject);
  });
}

function toLeafletCoordinates(coordinates) {
  if (!Array.isArray(coordinates) || coordinates.length !== 2) {
    return [19.1383, 77.321];
  }

  const [longitude, latitude] = coordinates;
  return [latitude, longitude];
}

function buildPopupContent(title) {
  const safeTitle = String(title || 'Listing Location')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `<strong>${safeTitle}</strong>`;
}

module.exports = {
  geocodeLocation,
  toLeafletCoordinates,
  buildPopupContent,
};
