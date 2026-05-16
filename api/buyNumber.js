const twilio = require('twilio');

/**
 * Vercel serverless function to purchase a US local phone number via Twilio
 * 
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID: Your Twilio Account SID
 * - TWILIO_AUTH_TOKEN: Your Twilio Auth Token
 * 
 * Query Parameters (Optional):
 * - areaCode: US area code for the phone number (default: random)
 * - contains: Optional string the phone number should contain
 * 
 * Example: GET /api/buyNumber?areaCode=415
 */
module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'Please use POST request'
    });
  }

  try {
    // Validate environment variables
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are not set'
      });
    }

    // Initialize Twilio client
    const client = twilio(accountSid, authToken);

    // Get optional parameters from query string or request body
    const areaCode = req.query.areaCode || req.body?.areaCode;
    const contains = req.query.contains || req.body?.contains;

    // Build search options
    const searchOptions = {
      countryCode: 'US',
      type: 'local'
    };

    if (areaCode) {
      searchOptions.areaCode = areaCode;
    }

    if (contains) {
      searchOptions.contains = contains;
    }

    // Search for available phone numbers
    const availableNumbers = await client.availablePhoneNumbers('US').local.list(searchOptions);

    if (!availableNumbers || availableNumbers.length === 0) {
      return res.status(404).json({
        error: 'No available numbers',
        message: 'Could not find any available phone numbers matching your criteria',
        criteria: searchOptions
      });
    }

    // Get the first available number
    const phoneNumberToPurchase = availableNumbers[0].phone_number;

    // Purchase the phone number
    const purchasedNumber = await client.incomingPhoneNumbers.create({
      phoneNumber: phoneNumberToPurchase
    });

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Phone number purchased successfully',
      data: {
        phoneNumber: purchasedNumber.phone_number,
        sid: purchasedNumber.sid,
        friendlyName: purchasedNumber.friendly_name,
        dateCreated: purchasedNumber.date_created,
        capabilities: purchasedNumber.capabilities,
        status: purchasedNumber.status
      }
    });

  } catch (error) {
    console.error('Error purchasing phone number:', error);

    // Return appropriate error response
    if (error.message.includes('Invalid Account')) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid Twilio credentials. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN'
      });
    }

    if (error.message.includes('insufficient account balance')) {
      return res.status(402).json({
        error: 'Insufficient funds',
        message: 'Your Twilio account does not have sufficient balance to purchase a phone number'
      });
    }

    return res.status(500).json({
      error: 'Server error',
      message: error.message,
      type: error.code || 'UNKNOWN_ERROR'
    });
  }
};
