const axios = require('axios');

/**
 * Self-pinging utility to prevent Render's free tier from sleeping.
 * Render free tier sleeps after 15 minutes of inactivity.
 * This script pings the health endpoint every 12 minutes.
 */
const keepAlive = (url) => {
  if (!url) {
    console.log('⚠️ No URL provided for keep-alive. Skipping self-ping.');
    return;
  }

  const interval = 12 * 60 * 1000; // 12 minutes

  console.log(`🚀 Keep-alive initialized. Pinging ${url} every 12 minutes.`);

  setInterval(async () => {
    try {
      const response = await axios.get(`${url}/health`);
      console.log(`📡 Self-ping successful: ${response.data.status} at ${new Date().toISOString()}`);
    } catch (error) {
      console.error(`❌ Self-ping failed: ${error.message}`);
    }
  }, interval);
};

module.exports = keepAlive;
