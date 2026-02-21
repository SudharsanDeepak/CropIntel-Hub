const axios = require("axios");
const getDemandForecast = async (days) => {
  const response = await axios.get(
    `http:
  );
  return response.data;
};
module.exports = { getDemandForecast };