const axios = require("axios");

const ML_BASE_URL = "https://cropintel-hub-ml.onrender.com"

const getDemandForecast = async (days) => {
  const response = await axios.get(
    `${ML_BASE_URL}/api/demand/forecast?days=${days}`
  );
  return response.data;
};

module.exports = { getDemandForecast };