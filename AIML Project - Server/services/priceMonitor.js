const axios = require('axios');
const Alert = require('../models/Alert');
const { sendPriceAlertEmail } = require('./priceAlertService');

const ML_API = process.env.ML_API_URL || 'http://localhost:8000'

// Track last check time and statistics
let lastCheckTime = null;
let totalChecks = 0;
let totalTriggered = 0;
let lastError = null;

const checkPriceAlerts = async () => {
  try {
    const checkStartTime = new Date();
    console.log(`\n🔍 [${checkStartTime.toLocaleTimeString()}] Checking price alerts...`);
    
    // Get all active alerts
    const alerts = await Alert.find({ status: 'active', triggered: false });
    
    if (alerts.length === 0) {
      console.log('   ℹ️  No active alerts to check');
      lastCheckTime = checkStartTime;
      totalChecks++;
      return { checked: 0, triggered: 0 };
    }
    
    console.log(`   📋 Found ${alerts.length} active alert(s) to check`);
    
    // Fetch latest product prices from ML API
    const response = await axios.get(`${ML_API}/products/latest`, {
      timeout: 30000 // 30 second timeout
    });
    
    const products = response.data || [];
    
    if (products.length === 0) {
      console.log('   ⚠️  No product data available from ML API');
      lastCheckTime = checkStartTime;
      totalChecks++;
      return { checked: 0, triggered: 0 };
    }
    
    console.log(`   💰 Loaded ${products.length} product prices`);
    
    // Create price map for quick lookup
    const priceMap = {};
    products.forEach(p => {
      priceMap[p.product] = p.price;
    });
    
    let triggeredCount = 0;
    let checkedCount = 0;
    
    // Check each alert
    for (const alert of alerts) {
      const currentPrice = priceMap[alert.product];
      
      if (!currentPrice) {
        console.log(`   ⚠️  No price data for "${alert.product}"`);
        continue;
      }
      
      checkedCount++;
      
      // Determine if alert should trigger
      let shouldTrigger = false;
      let conditionMet = '';
      
      if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true;
        conditionMet = `${currentPrice} <= ${alert.targetPrice}`;
      } else if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true;
        conditionMet = `${currentPrice} >= ${alert.targetPrice}`;
      }
      
      if (shouldTrigger) {
        console.log(`   🔔 ALERT TRIGGERED!`);
        console.log(`      Product: ${alert.product}`);
        console.log(`      Condition: ${alert.condition} ₹${alert.targetPrice}`);
        console.log(`      Current Price: ₹${currentPrice}`);
        console.log(`      User: ${alert.email}`);
        
        // Send email notification
        const emailResult = await sendPriceAlertEmail(
          alert.email,
          alert.product,
          currentPrice,
          alert.targetPrice,
          alert.condition
        );
        
        if (emailResult.success) {
          console.log(`   ✅ Email notification sent to ${alert.email}`);
          
          // Update alert status
          alert.triggered = true;
          alert.lastTriggeredAt = new Date();
          
          // If notify once, disable the alert
          if (alert.notifyOnce) {
            alert.status = 'triggered';
            console.log(`   📌 Alert disabled (notify once setting)`);
          }
          
          await alert.save();
          triggeredCount++;
          totalTriggered++;
        } else {
          console.log(`   ❌ Email failed: ${emailResult.error}`);
          if (emailResult.devMode) {
            console.log(`   ℹ️  Dev mode: Email not configured, but alert would have been sent`);
            // Still mark as triggered in dev mode
            alert.triggered = true;
            alert.lastTriggeredAt = new Date();
            if (alert.notifyOnce) {
              alert.status = 'triggered';
            }
            await alert.save();
            triggeredCount++;
            totalTriggered++;
          }
        }
      }
    }
    
    const checkDuration = Date.now() - checkStartTime.getTime();
    
    console.log(`\n   ✅ Check complete in ${checkDuration}ms`);
    console.log(`   📊 Checked: ${checkedCount} | Triggered: ${triggeredCount}`);
    console.log(`   📈 Total checks: ${totalChecks + 1} | Total triggered: ${totalTriggered}`);
    
    lastCheckTime = checkStartTime;
    totalChecks++;
    lastError = null;
    
    return { checked: checkedCount, triggered: triggeredCount };
    
  } catch (error) {
    console.error('❌ Error checking price alerts:', error.message);
    lastError = {
      message: error.message,
      time: new Date()
    };
    
    // Don't throw - let the cron continue
    return { checked: 0, triggered: 0, error: error.message };
  }
};

const startPriceMonitoring = () => {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 PRICE ALERT MONITORING SYSTEM STARTED');
  console.log('='.repeat(70));
  console.log('⏰ Schedule: Every 1 minute (continuous monitoring)');
  console.log('📧 Email notifications: Enabled');
  console.log('🔗 ML API: ' + ML_API);
  console.log('📅 Started at: ' + new Date().toLocaleString());
  console.log('🔧 Using: setInterval (60000ms)');
  console.log('='.repeat(70) + '\n');
  
  // Run initial check immediately
  console.log('🔄 Running initial check...');
  checkPriceAlerts().catch(err => {
    console.error('❌ Initial check failed:', err.message);
  });
  
  // Use setInterval for reliable execution every minute (60000ms)
  // This is more reliable than node-cron on some cloud platforms
  const intervalId = setInterval(() => {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] Interval triggered - running scheduled check...`);
    checkPriceAlerts().catch(err => {
      console.error('❌ Scheduled check failed:', err.message);
    });
  }, 60000); // 60000ms = 1 minute
  
  console.log('✅ Monitoring system active - checking every minute');
  console.log(`✅ Interval ID: ${intervalId}\n`);
  
  return intervalId;
};

const triggerManualCheck = async () => {
  console.log('\n🔧 Manual price check triggered by user');
  const result = await checkPriceAlerts();
  return result;
};

const getMonitoringStats = () => {
  return {
    lastCheckTime,
    totalChecks,
    totalTriggered,
    lastError,
    isRunning: true,
    checkInterval: '1 minute',
    mlApiUrl: ML_API
  };
};

module.exports = {
  startPriceMonitoring,
  triggerManualCheck,
  checkPriceAlerts,
  getMonitoringStats,
};