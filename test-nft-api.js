const axios = require("axios");

// Test the exact format that works
async function testNFTAPI() {
  const url = "https://api.1inch.dev/nft/v2/byaddress";

  const config = {
    headers: {
      Authorization: "Bearer HWYOP5bw0bA9VhUN35ymzmrvF4NqaDWR",
    },
    params: {
      chainIds: [137],
      address: "0xCDd40F678a08613742bE4c55b77e491ADDA97036",
    },
    paramsSerializer: {
      indexes: null,
    },
  };

  try {
    const response = await axios.get(url, config);
    console.log('✅ SUCCESS:');
    console.log('Full URL with params:', response.request.res.responseUrl || response.config.url);
    console.log('Request URL:', response.request.path);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ ERROR:', error.response?.status, error.response?.statusText);
    console.error('URL:', error.config?.url);
    console.error('Response:', error.response?.data);
  }
}

testNFTAPI();