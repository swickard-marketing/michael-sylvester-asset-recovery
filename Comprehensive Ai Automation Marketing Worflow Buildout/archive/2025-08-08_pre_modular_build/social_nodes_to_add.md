# Social Media Nodes to Add Manually

Since the full JSON import is having issues, add these nodes individually to your master workflow:

## 1. First, Add Social Scoring Node
**Type**: Code (Function)
**Connect From**: Route by Stage (create 5th output)
```javascript
// Social scoring based on journey stage
const items = [];
for (const item of $input.all()) {
  const data = item.json;
  let social_action = 'monitor';
  let platforms = [];
  let content_type = 'educational';
  let urgency = 'normal';
  
  // Determine action by stage
  switch(data.journey_stage) {
    case 'awareness':
      social_action = 'brand_awareness';
      platforms = ['facebook', 'instagram', 'youtube'];
      content_type = 'educational';
      break;
    case 'consideration':
      social_action = 'nurture';
      platforms = ['facebook', 'instagram'];
      content_type = 'comparison';
      break;
    case 'intent':
      social_action = 'retargeting';
      platforms = ['facebook', 'instagram'];
      content_type = 'promotional';
      urgency = data.intent_level === 'high' ? 'immediate' : 'normal';
      break;
    case 'conversion':
      social_action = 'conversion_push';
      platforms = ['facebook'];
      content_type = 'offer';
      urgency = 'high';
      break;
    case 'retention':
      social_action = 'loyalty';
      platforms = ['facebook', 'instagram'];
      content_type = 'community';
      break;
  }
  
  // Calculate social score
  let social_score = 0;
  if (data.social_interactions > 10) social_score = 30;
  else if (data.social_interactions > 5) social_score = 20;
  else if (data.social_interactions > 0) social_score = 10;
  
  items.push({
    json: {
      ...data,
      social_action: social_action,
      platforms: platforms,
      content_type: content_type,
      urgency: urgency,
      social_score: social_score,
      social_segment: social_score >= 30 ? 'influencer' : social_score >= 15 ? 'engaged' : 'passive'
    }
  });
}
return items;
```

---

## 2. Add Social Platform Router
**Type**: Switch
**Connect From**: Social Scoring
**Settings**:
- Mode: Expression
- Value: `{{ $json.social_action }}`
- Rules:
  - brand_awareness → Output 0
  - nurture → Output 1
  - retargeting → Output 2
  - conversion_push → Output 3
  - loyalty → Output 4

---

## 3. Add Metricool Brand Awareness
**Type**: HTTP Request
**Connect From**: Social Router (Output 0)
**Settings**:
- Method: POST
- URL: `https://api.metricool.com/v1/posts`
- Authentication: Header Auth
- Headers:
  - X-API-Key: `{{ $credentials.metricoolApiKey }}`
- Body (JSON):
```json
{
  "accounts": ["facebook", "instagram"],
  "content": {
    "text": "🚗 Discover your dream car at Swickard! Check out our latest models with special financing available.",
    "media": [{
      "type": "image",
      "url": "https://swickard.com/images/brand.jpg"
    }]
  },
  "schedule": {
    "publish_date": "{{ $now.plus({hours: 2}).toISO() }}"
  }
}
```

---

## 4. Add Metricool Retargeting
**Type**: HTTP Request
**Connect From**: Social Router (Output 2)
**Settings**:
- Method: POST
- URL: `https://api.metricool.com/v1/ads/retargeting`
- Authentication: Header Auth
- Headers:
  - X-API-Key: `{{ $credentials.metricoolApiKey }}`
- Body (JSON):
```json
{
  "campaign_name": "Retargeting_{{ $json.user_id }}",
  "platforms": ["facebook", "instagram"],
  "audience": {
    "email": "{{ $json.email }}",
    "user_id": "{{ $json.user_id }}"
  },
  "creative": {
    "headline": "{{ $json.first_name }}, Your Vehicle is Waiting!",
    "description": "Special offer expires soon!",
    "cta": "Get Quote"
  },
  "budget": {
    "daily": 50
  }
}
```

---

## 5. Add Social Analytics Fetch
**Type**: HTTP Request
**Connect From**: All Metricool nodes
**Settings**:
- Method: GET
- URL: `https://api.metricool.com/v1/analytics/engagement`
- Headers:
  - X-API-Key: `{{ $credentials.metricoolApiKey }}`
- Query Parameters:
  - user_id: `{{ $json.user_id }}`
  - metrics: `likes,comments,shares,reach`

---

## 6. Add Social Customer.io Update
**Type**: Customer.io
**Connect From**: Social Analytics
**Settings**:
- Resource: Customer
- Operation: Upsert
- Customer ID: `{{ $json.user_id }}`
- Email: `{{ $json.email }}`
- Custom Attributes:
  - social_score: `{{ $json.social_score }}`
  - social_segment: `{{ $json.social_segment }}`
  - social_action: `{{ $json.social_action }}`
  - preferred_platforms: `{{ $json.platforms.join(',') }}`
  - last_social_campaign: `{{ $now.toISO() }}`

---

## 7. Add Social BigQuery Log
**Type**: Google BigQuery
**Connect From**: Customer.io Update
**Settings**:
- Operation: Execute Query
- Query:
```sql
INSERT INTO `project.dataset.social_campaigns` 
(user_id, email, journey_stage, social_action, platforms, 
 content_type, social_score, social_segment, urgency, timestamp)
VALUES 
('{{ $json.user_id }}', '{{ $json.email }}', '{{ $json.journey_stage }}',
 '{{ $json.social_action }}', '{{ $json.platforms.join(",") }}',
 '{{ $json.content_type }}', {{ $json.social_score }}, 
 '{{ $json.social_segment }}', '{{ $json.urgency }}', '{{ $now.toISO() }}')
```

---

## CONNECTION DIAGRAM

```
Your Master Workflow:
─────────────────────

Route by Stage (modify to add 5th output)
     ↓
     └─[Output 5]──→ Social Scoring (new)
                            ↓
                     Social Router (new)
                            ↓
                ┌───────────┼───────────┐
                ↓           ↓           ↓
          Brand Post   Retargeting   Other
                ↓           ↓           ↓
                └───────────┴───────────┘
                            ↓
                     Social Analytics (new)
                            ↓
                     Update Customer.io (new)
                            ↓
                     Log to BigQuery (new)
                            ↓
                     [Back to main flow]
```

---

## MANUAL SETUP STEPS

1. **In your Route by Stage node:**
   - Edit the Switch node
   - Add a new rule: `journey_stage contains "awareness" OR "consideration" OR "intent"`
   - Set it to Output 5

2. **Create the Social Scoring node:**
   - Add a Code/Function node
   - Paste the scoring code above
   - Connect from Route by Stage Output 5

3. **Add remaining nodes in sequence:**
   - Social Router (Switch)
   - Metricool nodes (HTTP Request)
   - Analytics fetch (HTTP Request)
   - Customer.io update
   - BigQuery log

4. **Configure Metricool credentials:**
   - Go to Credentials in n8n
   - Add new "Header Auth"
   - Name: Metricool API
   - Header Name: X-API-Key
   - Header Value: [Your API Key]

5. **Test with sample data:**
   - Use Manual execution
   - Provide test JSON with required fields
   - Check each node output

---

## REQUIRED TEST DATA

```json
{
  "user_id": "test123",
  "email": "test@example.com",
  "first_name": "John",
  "journey_stage": "consideration",
  "intent_level": "medium",
  "intent_score": 45,
  "social_interactions": 7,
  "vehicle_interest": "Toyota Camry"
}
```

This manual approach avoids the import issues and lets you build the social flow piece by piece!