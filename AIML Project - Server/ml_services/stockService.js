const axios = require("axios");

const ML_BASE_URL = "https://cropintel-hub-ml.onrender.com"

const getStockOptimization = async (days) => {
  try {
    const response = await axios.get(
      `${ML_BASE_URL}/analysis/stock?days=${days}`
    );
    return response.data;
  } catch (error) {
    console.error("Stock service error:", error.message);
    throw new Error("Stock service failed");
  }
};
module.exports = {
  getStockOptimization,
};