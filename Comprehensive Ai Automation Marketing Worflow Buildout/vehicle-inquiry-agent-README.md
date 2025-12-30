# Vehicle Inquiry Agent - n8n Workflow Documentation

## Overview

An AI-powered SMS conversation workflow that engages potential car buyers through automated vehicle inquiries. When customers click "Unlock Price" on your website and opt-in for SMS communication, this workflow initiates an intelligent conversation using Claude AI to answer questions, provide pricing, check availability, and qualify leads for your sales team.

## Workflow Version

- **Original Version**: `vehicle-inquiry-agent-workflow.json` (Uses HTTP Request nodes)
- **Improved Version**: `vehicle-inquiry-agent-workflow-improved.json` (Uses native n8n nodes - **RECOMMENDED**)

## Key Improvements in v2.0

### 1. Native Twilio Nodes
- **Before**: Used `n8n-nodes-base.httpRequest` with manual Twilio API calls
- **After**: Uses `n8n-nodes-base.twilio` native node
- **Benefits**: Simpler config, automatic error handling, built-in credential management

### 2. Native Twilio Trigger
- **Before**: Generic webhook node for inbound SMS
- **After**: `n8n-nodes-base.twilioTrigger`
- **Benefits**: Automatic Twilio webhook configuration, signature verification, native event handling

### 3. Better Error Handling
- Updated webhook configuration for proper error responses
- Uses typeVersion 2 for improved node stability

### 4. Enhanced Security
- Removed wildcard CORS (`allowedOrigins: "*"`)
- Added webhook signature verification via Twilio Trigger
- Better credential isolation

## Workflow Flow

```
┌─────────────────────────────────────────────────────────────┐
│                  INITIAL CONVERSATION FLOW                  │
└─────────────────────────────────────────────────────────────┘

Website Widget (Customer clicks "Unlock Price")
    │
    ├──> Webhook - Widget Trigger
    │
    ├──> Validate Required Fields (phone, vehicleId)
    │         │
    │         ├──> [Valid] → Prepare Agent Context
    │         │                    │
    │         │                    ├──> Send Initial SMS (Twilio)
    │         │                         │
    │         │                         └──> Success Response to Widget
    │         │
    │         └──> [Invalid] → Error Response (400)


┌─────────────────────────────────────────────────────────────┐
│                 CONVERSATION LOOP (SMS REPLIES)             │
└─────────────────────────────────────────────────────────────┘

Customer replies via SMS
    │
    ├──> Twilio Inbound SMS Trigger
    │
    ├──> Parse Inbound SMS
    │
    ├──> Anthropic Claude Agent (AI Response)
    │
    ├──> Process Agent Response
    │         │
    │         ├──> Send Agent Reply (Twilio)
    │         │
    │         └──> Check Lead Qualification
    │                   │
    │                   ├──> Is Lead Qualified?
    │                         │
    │                         ├──> [Yes] → Forward to CRM
    │                         │              │
    │                         │              └──> Send Confirmation SMS
    │                         │
    │                         └──> [No] → Continue conversation
```

## Prerequisites

### 1. n8n Installation
- n8n v1.0+ installed
- Access to n8n workflow editor

### 2. Twilio Account
- Active Twilio account
- Phone number with SMS capabilities
- Account SID and Auth Token

### 3. Anthropic API
- Anthropic API key
- Access to Claude 3.5 Sonnet model

### 4. Environment Variables
Create the following environment variables in n8n:

```bash
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio number (E.164 format)
CRM_WEBHOOK_URL=https://your-crm.com/api/leads  # Optional: For lead forwarding
```

## Setup Instructions

### Step 1: Configure Credentials in n8n

#### Twilio Credentials
1. Go to n8n → Credentials → Create New
2. Select "Twilio API"
3. Enter:
   - **Account SID**: From Twilio Console
   - **Auth Token**: From Twilio Console
4. Test connection and save

#### Anthropic Credentials
1. Go to n8n → Credentials → Create New
2. Select "Anthropic API"
3. Enter:
   - **API Key**: From Anthropic Console
4. Save

### Step 2: Import Workflow

1. Download `vehicle-inquiry-agent-workflow-improved.json`
2. In n8n, go to Workflows → Import from File
3. Select the JSON file
4. Click Import

### Step 3: Configure Webhook URL

1. Activate the workflow (toggle to Active)
2. Click on "Webhook - Widget Trigger" node
3. Copy the Production Webhook URL
4. Add this URL to your website's "Unlock Price" button

Example JavaScript:
```javascript
document.getElementById('unlock-price-btn').addEventListener('click', async function() {
  const webhookUrl = 'https://your-n8n-instance.com/webhook/vehicle-inquiry-trigger';

  const payload = {
    vehicleId: vehicleData.id,
    vehicleMake: vehicleData.make,
    vehicleModel: vehicleData.model,
    vehicleYear: vehicleData.year,
    vehiclePrice: vehicleData.price,
    vehicleStatus: vehicleData.status,
    customerPhone: customerPhone, // Collected from form (E.164 format)
    customerName: customerName,
    dealershipId: 'DEALER001',
    dealershipName: 'Your Dealership Name',
    timestamp: new Date().toISOString()
  };

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();
  if (result.success) {
    alert('Check your phone for a text message!');
  }
});
```

### Step 4: Configure Twilio Webhook (Automatic)

When you activate the workflow, the Twilio Trigger node automatically configures the webhook in your Twilio account. No manual configuration needed!

**Manual Configuration (if needed)**:
1. Go to Twilio Console → Phone Numbers → Active Numbers
2. Click your phone number
3. Under "Messaging":
   - Set "A MESSAGE COMES IN" to the Twilio Trigger webhook URL
   - Method: HTTP POST
4. Save

## Node Configuration Details

### Native Twilio Node Configuration

```json
{
  "parameters": {
    "resource": "sms",
    "operation": "send",
    "from": "={{ $env.TWILIO_PHONE_NUMBER }}",
    "to": "={{ $json.customerContext.phone }}",
    "message": "={{ $json.initialMessage }}"
  },
  "type": "n8n-nodes-base.twilio",
  "typeVersion": 2
}
```

### Twilio Trigger Configuration

```json
{
  "parameters": {
    "updates": ["com.twilio.messaging.inbound-message.received"]
  },
  "type": "n8n-nodes-base.twilioTrigger",
  "typeVersion": 1.1
}
```

### Anthropic Agent Configuration

```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.anthropic.com/v1/messages",
    "jsonBody": {
      "model": "claude-3-5-sonnet-20241022",
      "max_tokens": 300,
      "system": "You are a helpful vehicle sales assistant...",
      "messages": [
        {
          "role": "user",
          "content": "{{ $json.customerMessage }}"
        }
      ]
    }
  }
}
```

## Lead Qualification Logic

The workflow automatically qualifies leads based on keyword detection:

**Qualification Keywords:**
- `test drive`
- `appointment`
- `visit`
- `buy` / `purchase`
- `financing` / `finance`
- `trade-in`
- `call me` / `contact me`
- `interested`
- `come in` / `stop by`

When a qualified lead is detected:
1. Lead information is forwarded to your CRM
2. Confirmation SMS is sent to customer
3. Sales team is notified

## Customization Options

### 1. Modify AI Agent Personality

Edit the `systemPrompt` in the "Prepare Agent Context" node:

```javascript
const systemPrompt = `You are a helpful vehicle sales assistant for ${vehicleContext.dealership}.

Your role:
1. Assist customers with inquiries
2. Provide pricing information
3. Check availability
4. Qualify leads

Guidelines:
- Keep responses under 160 characters
- Be friendly and professional
- Focus on customer needs
`;
```

### 2. Add CRM Integration

Replace the "Forward Lead to CRM" HTTP Request node with:
- **Salesforce node**: `n8n-nodes-base.salesforce`
- **HubSpot node**: `n8n-nodes-base.hubspot`
- **Email node**: `n8n-nodes-base.emailSend`

### 3. Add Conversation Persistence

Add a PostgreSQL node after "Process Agent Response":

```javascript
// Store conversation in database
INSERT INTO conversations (
  phone_number,
  vehicle_id,
  customer_message,
  agent_message,
  timestamp
) VALUES (
  $json.customerPhone,
  $json.vehicleId,
  $json.customerMessage,
  $json.agentMessage,
  NOW()
)
```

### 4. Enhance with AI Agent Node

For advanced features like conversation memory and tool calling, consider upgrading to the AI Agent architecture:

- Use `nodes-langchain.agent` (AI Agent node)
- Use `nodes-langchain.lmChatAnthropic` (Anthropic Chat Model)
- Add tools for:
  - Inventory checking
  - Real-time pricing
  - Appointment scheduling
  - CRM lookups

## Testing

### Test Initial Flow

1. Activate workflow
2. Use curl to test webhook:

```bash
curl -X POST https://your-n8n-instance.com/webhook/vehicle-inquiry-trigger \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "VEH001",
    "vehicleMake": "Toyota",
    "vehicleModel": "Camry",
    "vehicleYear": "2024",
    "vehiclePrice": "$28,500",
    "vehicleStatus": "available",
    "customerPhone": "+15551234567",
    "customerName": "John Doe",
    "dealershipId": "DEALER001",
    "dealershipName": "ABC Motors",
    "timestamp": "2025-10-13T10:00:00Z"
  }'
```

3. Check phone for SMS

### Test Conversation Loop

1. Reply to the SMS from your phone
2. Verify Claude responds appropriately
3. Check workflow execution history in n8n

### Test Lead Qualification

1. Send SMS with "I'd like to schedule a test drive"
2. Verify:
   - Lead forwarded to CRM
   - Confirmation SMS received

## Troubleshooting

### Issue: SMS not received

**Solution**:
- Verify Twilio credentials are correct
- Check TWILIO_PHONE_NUMBER environment variable
- Ensure phone number is in E.164 format (+1234567890)
- Check Twilio Console for delivery errors

### Issue: Claude not responding

**Solution**:
- Verify Anthropic API credentials
- Check API key has sufficient credits
- Review workflow execution logs for errors
- Ensure model name is correct: `claude-3-5-sonnet-20241022`

### Issue: Webhook not triggering

**Solution**:
- Ensure workflow is **Active**
- Check webhook URL is correct
- Verify CORS settings (allowedOrigins)
- Test with curl command
- Check n8n logs for webhook errors

### Issue: Twilio Trigger not working

**Solution**:
- Verify Twilio credentials
- Check Twilio Console → Webhook Configuration
- Ensure workflow is active
- Test by sending SMS directly to Twilio number

## Performance Optimization

### 1. Add Rate Limiting
Implement rate limiting to prevent abuse:
- Use Redis to track requests per phone number
- Limit to 10 messages per hour per customer

### 2. Add Caching
Cache common responses:
- Vehicle pricing data
- Availability status
- Dealership information

### 3. Implement Conversation Timeout
Automatically end inactive conversations:
- Store last activity timestamp
- End conversation after 30 minutes of inactivity

## Security Best Practices

1. **Restrict Webhook Access**
   - Set `allowedOrigins` to your domain only
   - Implement webhook signature verification

2. **Sanitize Customer Input**
   - Validate phone numbers (E.164 format)
   - Escape special characters in messages

3. **Protect Credentials**
   - Never hardcode API keys
   - Use n8n credential system
   - Rotate credentials regularly

4. **Monitor Usage**
   - Track API costs (Anthropic + Twilio)
   - Set up alerts for unusual activity
   - Log all conversations for compliance

## Cost Estimation

### Twilio SMS Costs
- **Outbound SMS**: ~$0.0075 per message (US)
- **Inbound SMS**: ~$0.0075 per message (US)
- **Monthly Base**: $1.00 per phone number

### Anthropic API Costs
- **Claude 3.5 Sonnet**:
  - Input: $3.00 per million tokens
  - Output: $15.00 per million tokens
- **Average conversation**: 300 tokens × 5 messages = ~$0.02

### Estimated Monthly Cost (1000 conversations)
- Twilio: ~$30 (2 SMS per conversation × 1000 × $0.015)
- Anthropic: ~$20 (1000 conversations × $0.02)
- **Total**: ~$50/month for 1000 conversations

## Future Enhancements

### Phase 1: Database Persistence
- Add PostgreSQL for conversation storage
- Implement conversation history retrieval
- Build admin dashboard for viewing conversations

### Phase 2: Advanced AI Features
- Upgrade to AI Agent node with tools
- Add inventory checking capability
- Implement appointment scheduling
- Add trade-in value estimation

### Phase 3: Multi-Channel Support
- Add WhatsApp support (via Twilio)
- Add web chat widget
- Add email follow-up automation

### Phase 4: Analytics & Reporting
- Track conversion rates
- Measure response times
- Analyze common customer questions
- A/B test different agent prompts

## Support & Resources

- **n8n Documentation**: https://docs.n8n.io
- **Twilio API Docs**: https://www.twilio.com/docs
- **Anthropic API Docs**: https://docs.anthropic.com
- **n8n Community**: https://community.n8n.io

## License

This workflow is provided as-is for use with your automotive dealership operations.

## Version History

- **v2.0.0** (2025-10-13): Improved version with native Twilio nodes
- **v1.0.0** (Initial): Original version with HTTP Request nodes

---

**Note**: This workflow is designed for the automotive industry but can be adapted for any sales inquiry system that requires SMS-based AI conversations.
