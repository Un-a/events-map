
async function geocode(address) {
  if (!address) return null;

  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "events-map-belgrade/1.0"
      }
    });

    const data = await response.json();

    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error(`Ошибка геокодинга для "${address}":`, error.message);
    return null;
  }
}

module.exports = { geocode };