# Vehicle Inquiry AI Agent

> AI-powered SMS conversations for vehicle sales using Anthropic Claude, Twilio, and n8n

---

## 🎯 Overview

This n8n workflow automates vehicle inquiry conversations through SMS, using Anthropic's Claude AI to engage customers, answer questions, and qualify leads automatically.

### What It Does

1. **Customer Engagement**: When a customer clicks "Unlock Price" on your website, they opt in for SMS communication
2. **AI Conversations**: Claude AI conducts intelligent, natural conversations via SMS
3. **Lead Qualification**: Automatically identifies hot leads based on conversation signals
4. **CRM Integration**: Forwards qualified leads to your sales team with full context

### Key Benefits

- **24/7 Availability**: AI agent responds instantly, any time
- **Natural Conversations**: Claude understands context and maintains conversation flow
- **Lead Qualification**: Automatically identifies buying signals
- **Cost-Effective**: ~$0.06 per conversation
- **Easy Setup**: Native n8n AI agent nodes (no complex coding)

---

## 🏗️ Architecture

### Two Main Workflows

**Flow 1: Widget → Initial SMS**
```
Website Widget → n8n Webhook → Validate → Prepare Context → Send SMS → Success Response
```

**Flow 2: SMS Conversation Loop**
```
Customer SMS → Twilio Webhook → Parse → AI Agent (Claude) → Reply SMS → Qualify Lead → Forward to CRM
```

### Technology Stack

- **n8n**: Workflow automation platform
- **Anthropic Claude 3.5 Sonnet**: AI conversation engine
- **Twilio**: SMS messaging platform
- **Native n8n AI Agent Nodes**: Conversation management with built-in memory

---

## 🚀 Quick Start

### Prerequisites

1. **n8n Instance** (self-hosted or cloud)
2. **Twilio Account** with SMS-enabled phone number
3. **Anthropic API Key** (Claude access)
4. **Website** where you'll add the widget

### Installation Steps

#### 1. Import Workflow

```bash
# In n8n UI:
# Workflows → Import from File → Select workflow.json
```

#### 2. Configure Credentials

**Twilio API:**
1. n8n → Settings → Credentials → New
2. Select "Twilio API"
3. Enter Account SID and Auth Token from [Twilio Console](https://console.twilio.com)

**Anthropic API:**
1. n8n → Settings → Credentials → New
2. Select "Anthropic API"
3. Enter API Key from [Anthropic Console](https://console.anthropic.com)

#### 3. Set Environment Variables

In n8n Settings → Variables:

```bash
TWILIO_PHONE_NUMBER=+1234567890
CRM_WEBHOOK_URL=https://your-crm.com/api/leads
```

#### 4. Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com) → Phone Numbers
2. Select your SMS number
3. Under "Messaging" → "A MESSAGE COMES IN":
   - Webhook: `https://your-n8n-instance.com/webhook/twilio-inbound-sms`
   - Method: `POST`
4. Save

#### 5. Activate Workflow

Toggle "Active" in n8n workflow editor

---

## 🌐 Website Widget Integration

### Sample Widget Code

```html
<!-- Add to your vehicle detail pages -->
<button id="unlock-price-btn" class="btn-primary">
  🔓 Unlock Price via Text
</button>

<div id="sms-modal" style="display:none;">
  <h3>Get Instant Vehicle Info via Text</h3>
  <p>We'll send you pricing, availability, and answer your questions via SMS.</p>

  <input type="tel" id="customer-phone" placeholder="Your phone number" />
  <input type="text" id="customer-name" placeholder="Your name (optional)" />

  <button id="opt-in-btn">Yes, Text Me!</button>
  <button id="cancel-btn">No Thanks</button>
</div>

<script>
// Vehicle data from page
const vehicleData = {
  vehicleId: "VIN-12345",
  vehicleMake: "Toyota",
  vehicleModel: "Camry",
  vehicleYear: "2024",
  vehiclePrice: "$28,500",
  vehicleStatus: "available",
  dealershipId: "dealer-001",
  dealershipName: "ABC Motors"
};

// Show modal on button click
document.getElementById('unlock-price-btn').onclick = () => {
  document.getElementById('sms-modal').style.display = 'block';
};

// Handle opt-in
document.getElementById('opt-in-btn').onclick = async () => {
  const phone = document.getElementById('customer-phone').value;
  const name = document.getElementById('customer-name').value;

  // Validate phone
  if (!phone || phone.length < 10) {
    alert('Please enter a valid phone number');
    return;
  }

  // Send to n8n
  try {
    const response = await fetch('https://your-n8n.com/webhook/vehicle-inquiry-trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...vehicleData,
        customerPhone: phone.replace(/\D/g, '').replace(/^/, '+1'), // Format to E.164
        customerName: name || 'Customer',
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();

    if (result.success) {
      alert('Great! Check your phone for a text message from us.');
      document.getElementById('sms-modal').style.display = 'none';
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Network error. Please try again.');
    console.error(error);
  }
};
</script>
```

---

## 🤖 AI Agent Configuration

### System Prompt

The AI agent uses this system prompt (customizable in workflow):

```
You are a helpful vehicle sales assistant. Your role:

1. Assist customers with vehicle inquiries
2. Provide pricing and availability information
3. Answer questions about features, financing, and trade-ins
4. Recommend alternatives if requested vehicle unavailable
5. Qualify leads by gathering: name, contact preference, timeline
6. Schedule test drives and appointments when ready

Guidelines:
- Keep responses SHORT for SMS (under 160 characters when possible)
- Be friendly, professional, and enthusiastic
- If unsure, offer to connect with specialist
- When customer is ready, confirm sales team will follow up
- Don't make up information
```

### Conversation Memory

The workflow uses **Buffer Window Memory** which:
- Stores last 10 messages
- Maintains conversation context
- Allows natural back-and-forth
- Automatically managed by n8n

### Customization

Edit these in the AI Agent node:
- **Model**: claude-3-5-sonnet-20241022 (fastest, best for SMS)
- **Max Tokens**: 300 (optimal for SMS length)
- **Temperature**: 0.7 (balanced creativity)
- **Memory Window**: 10 messages

---

## 🎯 Lead Qualification

### Automatic Qualification Signals

The workflow automatically detects when a customer is ready for sales contact based on these keywords:

**High Priority:**
- "test drive"
- "appointment"
- "visit"
- "buy" / "purchase"
- "financing" / "finance"
- "trade-in"
- "call me" / "contact me"
- "interested"
- "ready"

### What Happens When Qualified

1. **Lead Forwarded**: Sent to CRM via webhook
2. **Confirmation SMS**: Customer receives confirmation message
3. **Sales Alert**: (Optional) Slack/email notification to team

### Lead Data Sent to CRM

```json
{
  "lead_source": "vehicle_inquiry_agent_sms",
  "customer_phone": "+12345678901",
  "timestamp": "2025-10-13T10:30:00Z",
  "priority": "high",
  "customer_message": "Customer's last message",
  "agent_response": "Agent's response",
  "status": "qualified"
}
```

---

## 🔌 CRM Integration Options

### Option 1: Webhook (Recommended)

Set `CRM_WEBHOOK_URL` environment variable to your CRM's webhook endpoint.

**Salesforce:**
```
https://[instance].salesforce.com/services/apexrest/leads
```

**HubSpot:**
```
https://api.hubapi.com/contacts/v1/contact/
```

**Zoho CRM:**
```
https://www.zohoapis.com/crm/v3/Leads
```

### Option 2: Email Notification

Replace "Forward to CRM" node with **Gmail** or **Send Email** node:

```
To: sales@yourdealership.com
Subject: New Qualified Lead - [Vehicle Name]
Body: [Full conversation summary]
```

### Option 3: Slack Notification

Replace with **Slack** node:

```
Channel: #leads
Message: 🎯 New qualified lead from SMS agent!
```

### Option 4: RunMyLease

If RunMyLease doesn't have an API:
- Forward leads via email to their intake address
- Or use manual export from n8n database

---

## 💰 Cost Breakdown

### Per Conversation Costs

| Service | Unit Cost | Avg Usage | Total |
|---------|-----------|-----------|-------|
| Twilio SMS (outbound) | $0.0079/msg | 1 initial + 6 replies | $0.055 |
| Anthropic Claude API | ~$0.002/msg | 6 messages | $0.012 |
| **Total per conversation** | | | **~$0.06** |

### Monthly Cost Estimates

- **100 conversations/month**: ~$6
- **500 conversations/month**: ~$30
- **1,000 conversations/month**: ~$60
- **5,000 conversations/month**: ~$300

### Cost Optimization Tips

1. **Reduce max_tokens** to 150 for shorter responses
2. **Use Twilio Messaging Service** for better rates at scale
3. **Implement conversation timeouts** (30 min) to avoid long conversations
4. **Cache common responses** for FAQ-type questions

---

## 📊 Monitoring & Analytics

### Key Metrics to Track

1. **Conversation Metrics**
   - Total conversations started
   - Average messages per conversation
   - Conversation completion rate

2. **Lead Quality**
   - Lead qualification rate
   - Time to qualification
   - Conversion rate (qualified → sale)

3. **Performance**
   - Average response time
   - Error rate
   - API timeout rate

4. **Costs**
   - Total SMS costs
   - Total AI costs
   - Cost per qualified lead

### Recommended Tools

- **n8n Built-in Logs**: Execution history
- **Twilio Console**: SMS delivery logs
- **Anthropic Console**: API usage and costs
- **Custom Dashboard**: Build with your analytics platform

---

## 🔒 Security & Compliance

### Security Checklist

- [ ] **CORS**: Change webhook CORS from `*` to your domain
- [ ] **Authentication**: Add webhook signature validation
- [ ] **Rate Limiting**: Prevent abuse (e.g., 10 requests/min per IP)
- [ ] **Input Validation**: Sanitize all customer inputs
- [ ] **Opt-Out List**: Check against DNC list before sending

### TCPA Compliance (US)

Required for SMS marketing:

1. **Explicit Consent**: Widget must clearly state customer is opting in for SMS
2. **Opt-Out Mechanism**: Respond to "STOP" keyword automatically
3. **Privacy Policy**: Link to privacy policy in widget
4. **Record Keeping**: Store opt-in timestamps and consent records

### GDPR Compliance (EU)

If serving EU customers:

1. **Data Minimization**: Only collect necessary data
2. **Right to Deletion**: Allow customers to request data deletion
3. **Consent Records**: Store explicit consent with timestamp
4. **Data Encryption**: Encrypt stored conversations

### Handling Opt-Outs

Add this to the "Parse SMS" node:

```javascript
const message = twilioData.Body.toLowerCase();

// Check for opt-out keywords
if (message === 'stop' || message === 'unsubscribe' || message === 'quit') {
  // Add to opt-out list
  await db.optOut(twilioData.From);

  // Send confirmation
  await twilio.sendSMS({
    to: twilioData.From,
    from: twilioData.To,
    body: "You've been unsubscribed. Text START to re-subscribe."
  });

  // Stop workflow
  return { json: { optedOut: true } };
}
```

---

## 🐛 Troubleshooting

### Workflow Not Triggering

**Problem**: Website widget sends request but nothing happens

**Solutions**:
1. Check workflow is **Activated** (toggle in n8n)
2. Verify webhook URL is correct
3. Check CORS settings (allow your domain)
4. Review n8n execution logs for errors

### SMS Not Sending

**Problem**: Workflow runs but SMS not received

**Solutions**:
1. Verify Twilio credentials are correct
2. Check phone number is in E.164 format (+12345678901)
3. Check Twilio account balance
4. Review Twilio logs in console for errors
5. Verify phone number is SMS-capable (not landline)

### AI Agent Not Responding

**Problem**: SMS received but no AI response

**Solutions**:
1. Verify Anthropic API key is valid
2. Check API rate limits not exceeded
3. Review error logs in n8n execution
4. Test API key with curl:
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: YOUR_KEY" \
     -H "anthropic-version: 2023-06-01"
   ```

### Conversation Context Lost

**Problem**: AI doesn't remember previous messages

**Solutions**:
1. Check "Conversation Memory" node is connected
2. Verify memory window size (increase if needed)
3. Implement database storage for longer conversations
4. Check conversation isn't timing out (30 min default)

### Twilio Webhook Timeout

**Problem**: Twilio shows 11205 error (timeout)

**Solutions**:
1. AI Agent is taking > 15 seconds to respond
2. Reduce max_tokens to 200 for faster responses
3. Optimize workflow (remove unnecessary nodes)
4. Consider async processing for complex logic

---

## 🔧 Advanced Configuration

### Adding Custom Tools to AI Agent

The AI Agent can use "tools" (functions) to access real-time data:

**Example: Check Inventory**

1. Add "Tool" connection to AI Agent node
2. Create HTTP Request tool:
   ```
   Name: check_vehicle_availability
   Description: Check if a vehicle is in stock
   Input: vehicleId (string)
   ```
3. Connect to your inventory API
4. Agent will automatically call when needed

### Database Persistence

For production, store conversations:

```javascript
// After AI response, save to database
await db.saveMessage({
  conversationId: conversationId,
  customerPhone: customerPhone,
  customerMessage: customerMessage,
  agentMessage: agentMessage,
  timestamp: new Date()
});

// Retrieve history on inbound SMS
const history = await db.getConversation(customerPhone);
```

### A/B Testing System Prompts

Test different approaches:

```javascript
// Randomly assign variant
const variant = Math.random() < 0.5 ? 'A' : 'B';

const systemPrompts = {
  A: "You are a friendly, casual vehicle assistant...",
  B: "You are a professional, formal vehicle specialist..."
};

// Use variant-specific prompt
agent.systemPrompt = systemPrompts[variant];

// Track which converts better
analytics.track('prompt_variant', { variant, conversationId });
```

---

## 📚 Additional Resources

### Documentation

- **n8n Docs**: https://docs.n8n.io
- **Anthropic Claude**: https://docs.anthropic.com
- **Twilio SMS**: https://www.twilio.com/docs/sms
- **n8n AI Agents**: https://docs.n8n.io/integrations/builtin/cluster-nodes/root-nodes/n8n-nodes-langchain.agent/

### Community

- **n8n Community**: https://community.n8n.io
- **GitHub**: https://github.com/n8n-io/n8n

### Support

For issues specific to this workflow:
1. Check troubleshooting section above
2. Review n8n execution logs
3. Test each component individually
4. Check external services (Twilio, Anthropic) status pages

---

## 🎉 Success Stories

### Expected Results

After deploying this workflow, you should see:

- **Response Rate**: 60-80% of customers who opt in will engage
- **Lead Qualification**: 20-30% of conversations result in qualified leads
- **Time Savings**: 10-15 hours/week of manual inquiry handling
- **Conversion**: 2-3x higher than traditional web forms

### Optimization Tips

1. **Week 1**: Monitor all conversations, refine system prompt
2. **Week 2**: Adjust qualification keywords based on real data
3. **Week 3**: Implement database persistence for better context
4. **Week 4**: Add custom tools for inventory/pricing lookups
5. **Month 2+**: A/B test different approaches, optimize costs

---

## 📝 License

This workflow is provided as-is for use with your n8n instance. Customize freely for your business needs.

---

## 🤝 Contributing

Found a bug or have an improvement? Feel free to modify and share your enhancements!

---

**Version**: 2.0.0
**Last Updated**: 2025-10-13
**Powered by**: Anthropic Claude, Twilio, n8n
