const mapContainer = document.getElementById('map');

if (mapContainer && typeof L !== 'undefined') {
  const map = L.map('map').setView([19.1383, 77.3210], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map);

  L.marker([19.1383, 77.3210])
    .addTo(map)
    .bindPopup('Listing Location')
    .openPopup();
}
