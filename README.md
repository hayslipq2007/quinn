# Twilio Phone Number Provisioning API

A Vercel serverless API for automatically purchasing US local phone numbers using the Twilio SDK.

## Features

- ✅ Serverless Node.js API on Vercel
- ✅ Automatic US local phone number provisioning
- ✅ Support for optional area code targeting
- ✅ Environment variable configuration
- ✅ Comprehensive error handling
- ✅ JSON response format

## Prerequisites

- Node.js 18.x or higher
- [Twilio Account](https://www.twilio.com/console)
- Vercel account (for deployment)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Add your Twilio credentials:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
```

Get these from [Twilio Console](https://console.twilio.com/):
- **Account SID**: Dashboard → Account Info
- **Auth Token**: Dashboard → Account Settings

### 3. Local Development

```bash
npm run dev
```

The API will be available at `http://localhost:3000/api/buyNumber`

### 4. Deploy to Vercel

```bash
npm run deploy
```

Or push to GitHub and connect to Vercel for automatic deployments.

## API Usage

### Endpoint

```
POST /api/buyNumber
```

### Request

**Basic Request** (random US phone number):
```bash
curl -X POST http://localhost:3000/api/buyNumber
```

**With Area Code** (target specific area):
```bash
curl -X POST "http://localhost:3000/api/buyNumber?areaCode=415"
```

**With JSON Body**:
```bash
curl -X POST http://localhost:3000/api/buyNumber \
  -H "Content-Type: application/json" \
  -d '{"areaCode": "415", "contains": "1234"}'
```

### Query Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `areaCode` | string | US area code for phone number | `415` |
| `contains` | string | Digits the phone number should contain | `1234` |

### Success Response (200)

```json
{
  "success": true,
  "message": "Phone number purchased successfully",
  "data": {
    "phoneNumber": "+14155551234",
    "sid": "PN1234567890abcdefghijklmnopqrst",
    "friendlyName": "+1 415-555-1234",
    "dateCreated": "2026-05-16T10:30:00Z",
    "capabilities": {
      "voice": true,
      "SMS": true,
      "MMS": true
    },
    "status": "active"
  }
}
```

### Error Responses

**Method Not Allowed (405)**:
```json
{
  "error": "Method not allowed",
  "message": "Please use POST request"
}
```

**Configuration Error (500)**:
```json
{
  "error": "Configuration error",
  "message": "TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables are not set"
}
```

**No Available Numbers (404)**:
```json
{
  "error": "No available numbers",
  "message": "Could not find any available phone numbers matching your criteria",
  "criteria": {
    "countryCode": "US",
    "type": "local",
    "areaCode": "415"
  }
}
```

**Authentication Failed (401)**:
```json
{
  "error": "Authentication failed",
  "message": "Invalid Twilio credentials. Please check TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN"
}
```

**Insufficient Funds (402)**:
```json
{
  "error": "Insufficient funds",
  "message": "Your Twilio account does not have sufficient balance to purchase a phone number"
}
```

## Vercel Deployment

### 1. Create `vercel.json` Configuration

The `vercel.json` file is already included and configured for:
- Node.js serverless functions
- API routing
- Environment variable setup

### 2. Set Environment Variables in Vercel

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - `TWILIO_ACCOUNT_SID`: Your Account SID
   - `TWILIO_AUTH_TOKEN`: Your Auth Token

Or use Vercel CLI:

```bash
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
```

### 3. Deploy

```bash
vercel deploy --prod
```

Your API will be available at: `https://your-project.vercel.app/api/buyNumber`

## Project Structure

```
.
├── api/
│   └── buyNumber.js           # Main API route
├── package.json               # Dependencies and scripts
├── vercel.json               # Vercel configuration
├── .env.example              # Environment variables template
└── README.md                 # This file
```

## Cost Considerations

- Twilio local phone numbers: ~$1/month each
- Always verify available balance before provisioning
- Test with available number search before purchasing

## Troubleshooting

### "Invalid Account" Error
- Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
- Check they're set in environment variables

### "No Available Numbers" Error
- The area code might have limited availability
- Try without specifying an area code
- Check Twilio Console for available numbers

### "Insufficient Account Balance" Error
- Add funds to your Twilio account
- Upgrade to a paid account if on trial

### "Connection Refused" on Local Dev
- Run `npm run dev` to start the development server
- Check that no other service is using port 3000

## Security Best Practices

1. ✅ Never commit `.env.local` to Git (included in `.gitignore`)
2. ✅ Use Vercel Secrets for production credentials
3. ✅ Implement authentication if exposing this API publicly
4. ✅ Rate limit the endpoint to prevent abuse
5. ✅ Monitor Twilio spending and set billing alerts

## License

MIT

## References

- [Twilio SDK for Node.js](https://github.com/twilio/twilio-node)
- [Vercel Documentation](https://vercel.com/docs)
- [Twilio Console](https://console.twilio.com/)
