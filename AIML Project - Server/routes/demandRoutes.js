const express = require("express");
const router = express.Router();
const { getDemandForecast } = require("../ml_services/demandService");
router.get("/demand", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const data = await getDemandForecast(days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Demand service error" });
  }
});
module.exports = router;