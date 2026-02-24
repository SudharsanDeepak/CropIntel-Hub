const axios = require("axios");

const ML_BASE_URL = process.env.ML_API_URL || "http://localhost:8000"

const getDemandForecast = async (days) => {
  const response = await axios.get(
    `${ML_BASE_URL}/forecast/demand?days=${days}`
  );
  return response.data;
};

module.exports = { getDemandForecast };