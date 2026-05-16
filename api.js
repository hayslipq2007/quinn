const twilio = require('twilio');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return res.status(500).json({ error: 'Missing Twilio credentials' });
    }

    const client = twilio(accountSid, authToken);
    const { areaCode } = req.query;

    const searchOptions = { countryCode: 'US', type: 'local' };
    if (areaCode) searchOptions.areaCode = areaCode;

    const availableNumbers = await client.availablePhoneNumbers('US').local.list(searchOptions);

    if (!availableNumbers || availableNumbers.length === 0) {
      return res.status(404).json({ error: 'No available numbers' });
    }

    const phoneNumber = availableNumbers[0].phoneNumber;
    const purchased = await client.incomingPhoneNumbers.create({ phoneNumber });

    res.status(200).json({
      success: true,
      phoneNumber: purchased.phoneNumber,
      sid: purchased.sid
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
