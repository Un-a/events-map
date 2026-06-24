const knownLocations = require("../../data/knownLocations.json");

const unresolvedAddresses = [];

async function geocode(address) {
  if (!address) return null;

  const key = address.toLowerCase().trim();

  if (knownLocations[key]) {
    const { lat, lng } = knownLocations[key];
    return { lat, lng };
  }

  try {
    const query = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "events-map-belgrade/1.0"
      }
    });

    const data = await response.json();

    if (data.length === 0) {
      unresolvedAddresses.push(address);
      return null;
    }

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error(`Ошибка геокодинга для "${address}":`, error.message);
    return null;
  }
}

function getUnresolvedAddresses() {
  return unresolvedAddresses;
}

module.exports = { geocode, getUnresolvedAddresses };