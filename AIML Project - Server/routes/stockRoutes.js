const express = require("express");
const router = express.Router();
const { getStockOptimization } = require("../ml_services/stockService");
router.get("/stock", async (req, res) => {
  try {
    const days = req.query.days || 7;
    const data = await getStockOptimization(days);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Stock service error" });
  }
});
module.exports = router;