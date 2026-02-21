const express = require("express");
const router = express.Router();
const {
  getPriceForecast,
  getElasticityAnalysis,
} = require("../ml_services/priceService");
router.get("/price", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const data = await getPriceForecast(days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Price service error" });
  }
});
router.get("/elasticity", async (req, res) => {
  try {
    const data = await getElasticityAnalysis();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Elasticity service error" });
  }
});
module.exports = router;