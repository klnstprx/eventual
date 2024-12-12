import axios from "axios";

export const getLatLon = async (address) => {
  const url = "https://api.opencagedata.com/geocode/v1/json";
  const params = {
    q: address,
    key: import.meta.env.VITE_GEOCODING_API_KEY,
  };

  const response = await axios.get(url, { params });
  if (response.data.results.length === 0) {
    throw new Error("Address not found");
  }
  const { lat, lng } = response.data.results[0].geometry;
  return { lat, lon: lng };
};
