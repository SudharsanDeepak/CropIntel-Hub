const axios = require("axios");

const ML_BASE_URL = process.env.ML_API_URL || "http://localhost:8000"

const getPriceForecast = async (days) => {
  try {
    const response = await axios.get(
      `${ML_BASE_URL}/forecast/price?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error("Price service error:", error.message);
    throw new Error("Price service failed");
  }
};
const getElasticityAnalysis = async () => {
  try {
    const response = await axios.get(
      `${ML_BASE_URL}/analysis/elasticity`
    );
    return response.data;
  } catch (error) {
    console.error("Elasticity service error:", error.message);
    throw new Error("Elasticity service failed");
  }
};
module.exports = {
  getPriceForecast,
  getElasticityAnalysis,
};