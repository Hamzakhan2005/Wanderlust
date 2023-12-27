mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/dark-v11",

  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const marker = new mapboxgl.Marker()
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h4>${listing.location}</h4> <br> exact location after booking`
    )
  )
  .addTo(map);
