import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/weather/";

export const fetchWeather = async (city) => {
  const res = await axios.get(API_URL, { params: { city } });
  return res.data;
};
