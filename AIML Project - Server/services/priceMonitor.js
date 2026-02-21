const cron = require('node-cron');
const axios = require('axios');
const Alert = require('../models/Alert');
const { sendPriceAlertEmail } = require('./priceAlertService');

const ML_API = process.env.ML_API || 'http://localhost:8000'

const checkPriceAlerts = async () => {
  try {
    console.log('\n🔍 Checking price alerts...');
    const alerts = await Alert.find({ status: 'active', triggered: false });
    if (alerts.length === 0) {
      console.log('   No active alerts to check');
      return;
    }
    console.log(`   Found ${alerts.length} active alert(s)`);
    const response = await axios.get(`${ML_API}/products/latest`, {
      timeout: 10000
    });
    const products = response.data || [];
    if (products.length === 0) {
      console.log('   ⚠️  No product data available');
      return;
    }
    const priceMap = {};
    products.forEach(p => {
      priceMap[p.product] = p.price;
    });
    let triggeredCount = 0;
    for (const alert of alerts) {
      const currentPrice = priceMap[alert.product];
      if (!currentPrice) {
        console.log(`   ⚠️  No price data for ${alert.product}`);
        continue;
      }
      let shouldTrigger = false;
      if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
      } else if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
      }
      if (shouldTrigger) {
        console.log(`   🔔 Alert triggered: ${alert.product} ${alert.condition} ₹${alert.targetPrice}`);
        console.log(`      Current price: ₹${currentPrice}, Target: ₹${alert.targetPrice}`);
        const emailResult = await sendPriceAlertEmail(
          alert.email,
          alert.product,
          currentPrice,
          alert.targetPrice,
          alert.condition
        );
        if (emailResult.success) {
          console.log(`   ✅ Email sent to ${alert.email}`);
          alert.triggered = true;
          alert.lastTriggeredAt = new Date();
          if (alert.notifyOnce) {
            alert.status = 'triggered';
            console.log(`   📌 Alert disabled (notify once)`);
          }
          await alert.save();
          triggeredCount++;
        } else {
          console.log(`   ❌ Email failed: ${emailResult.error}`);
        }
      }
    }
    if (triggeredCount > 0) {
      console.log(`\n✅ Price check complete: ${triggeredCount} alert(s) triggered\n`);
    } else {
      console.log(`\n✅ Price check complete: No alerts triggered\n`);
    }
  } catch (error) {
    console.error('❌ Error checking price alerts:', error.message);
  }
};
const startPriceMonitoring = () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PRICE ALERT MONITORING STARTED');
  console.log('='.repeat(60));
  console.log('📅 Schedule: Every hour (at minute 0)');
  console.log('📧 Email notifications: Enabled');
  console.log('🔗 ML API: ' + ML_API);
  console.log('='.repeat(60) + '\n');
  checkPriceAlerts();
  cron.schedule('0 * * * *', () => {
    console.log(`\n⏰ Scheduled check triggered at ${new Date().toLocaleString()}`);
    checkPriceAlerts();
  });
};
const triggerManualCheck = async () => {
  console.log('\n🔧 Manual price check triggered');
  await checkPriceAlerts();
};
module.exports = {
  startPriceMonitoring,
  triggerManualCheck,
  checkPriceAlerts,
};