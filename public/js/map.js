const mapContainer = document.getElementById('map');

if (mapContainer && typeof L !== 'undefined') {
  const latitude = parseFloat(mapContainer.dataset.latitude || '19.1383');
  const longitude = parseFloat(mapContainer.dataset.longitude || '77.321');
  const title = mapContainer.dataset.title || 'Listing Location';

  const map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([latitude, longitude])
    .addTo(map)
    .bindPopup(`<strong>${title}</strong>`)
    .openPopup();
}
