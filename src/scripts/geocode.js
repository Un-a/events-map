const knownLocations = require("../../data/knownLocations.json");

const unresolvedAddresses = [];

async function geocode(address) {
  if (!address) return null;

  const key = address.toLowerCase().trim();

  if (knownLocations[key]) {
    const { lat, lng } = knownLocations[key];
    return { lat, lng };
  }

  const result = await fetchNominatim(address);
  if (result) return result;

  const withoutName = address.split(",").slice(1).join(",").trim();
  const hasEnoughInfo = withoutName.split(",").length >= 2;

  if (withoutName && withoutName !== address && hasEnoughInfo) {
    const fallbackResult = await fetchNominatim(withoutName);
    if (fallbackResult) return fallbackResult;
  }

  unresolvedAddresses.push(address);
  return null;
}

async function fetchNominatim(query) {
  try {
    const q = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: { "User-Agent": "events-map-belgrade/1.0" }
    });

    const data = await response.json();
    if (data.length === 0) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error(`Ошибка геокодинга для "${query}":`, error.message);
    return null;
  }
}

function getUnresolvedAddresses() {
  return unresolvedAddresses;
}

module.exports = { geocode, getUnresolvedAddresses };