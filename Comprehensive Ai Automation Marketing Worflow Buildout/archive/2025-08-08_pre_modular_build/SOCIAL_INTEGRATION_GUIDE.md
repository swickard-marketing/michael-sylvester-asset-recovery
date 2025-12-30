# Social Media Flow Integration Guide

## 🔗 WHERE TO ATTACH THE SOCIAL FLOW

### PRIMARY CONNECTION POINT:
**Attach to: "Route by Stage" node (id: 08d7457e-229a-47c5-bb12-0d09e94c8af0)**

Add a 5th output branch from your existing "Route by Stage" switch node:
```javascript
// In Route by Stage node, add:
{
  "value2": "social_required",
  "output": 5  // New branch for social media
}
```

Then connect output 5 to → **"Social Media Scoring"** node

---

## 🔄 INTEGRATION POINTS

### 1. **From Route by Stage → Social Flow**
```
Your Master Workflow                Social Media Flow
─────────────────────               ─────────────────
Route by Stage (Switch)     →       Social Media Scoring
   Output 5 (new)          ────→    (Entry point)
```

### 2. **Parallel to SMS (Multi-Channel)**
```
Check High Priority (Filter)
         ├── Send SMS (existing)
         └── Social Media Scoring (new parallel branch)
```

### 3. **After Customer.io Segments**
```
Awareness Segment          →    Social Media Scoring
Consideration Segment      →    (with journey_stage data)
Intent Segment            →    
Conversion Segment        →    
```

---

## 📊 DATA FLOW ARCHITECTURE

```
MASTER WORKFLOW                    SOCIAL MEDIA FLOW
═══════════════                    ═════════════════

Main Schedule
     ↓
Fetch Journey Data
     ↓
Universal Scoring Engine
     ↓
Update All Profiles
     ↓
Track All Events
     ↓
Route by Stage ──────────────────→ Social Media Scoring
     ↓                                      ↓
[Existing Segments]                 Route Social Action
     ↓                                      ↓
Check High Priority ─────────────→  [5 Social Campaigns]
     ↓                                      ↓
Send SMS ←───────────────────────   Social Analytics
     ↓                                      ↓
Log to BigQuery ←────────────────   Update Social Profile
     ↓                                      ↓
JOMP Analysis                       Track Social Event
                                           ↓
                                    Log Social to BigQuery
```

---

## 🛠️ IMPLEMENTATION STEPS

### Step 1: Modify Route by Stage Node
In your master workflow, edit the "Route by Stage" node:

```json
{
  "parameters": {
    "mode": "expression",
    "value1": "={{ $json.journey_stage }}",
    "rules": {
      "rules": [
        // ... existing rules ...
        {
          "value2": "all",  // Process all through social
          "output": 5
        }
      ]
    }
  }
}
```

### Step 2: Create Connection
1. Import the `social_media_flow.json`
2. Connect "Route by Stage" Output 5 → "Social Media Scoring" Input
3. Connect "Log Social to BigQuery" → Your existing "JOMP" node

### Step 3: Configure Metricool Credentials
Add in n8n credentials:
- **Name**: Metricool API
- **API Key**: Your Metricool API key
- **Type**: Header Authentication

---

## 🔑 REQUIRED DATA FROM MASTER FLOW

The social flow expects these fields from your master workflow:

```javascript
{
  // From your scoring engine
  "user_id": "string",
  "email": "string", 
  "first_name": "string",
  "phone": "string",
  
  // Journey data
  "journey_stage": "awareness|consideration|intent|conversion|retention",
  "intent_level": "high|medium|low",
  "intent_score": number,
  
  // Vehicle interest
  "vehicle_id": "string",
  "vehicle_interest": "string",
  "vehicle_brand": "string",
  "vehicle_category": "string",
  
  // Social metrics (if available)
  "social_interactions": number,
  "social_shares": number,
  "social_mentions": number
}
```

---

## 🎯 SOCIAL FLOW FEATURES

### Automatic Campaign Selection by Stage:

1. **Awareness** → Brand awareness posts (Facebook, Instagram, YouTube)
2. **Consideration** → Engagement nurture content (comparison videos)
3. **Intent** → Retargeting ads with urgency
4. **Conversion** → Time-limited offers with countdown
5. **Retention** → Loyalty programs and referral incentives

### Social Scoring System:
- Calculates social influence score (0-100)
- Segments users: Influencer (40+), Engaged (20-39), Passive (<20)
- Triggers influencer outreach for high scorers

### Platform Prioritization:
- Automatically selects best platforms per stage
- Adapts content type (educational, promotional, offer)
- Sets urgency levels for campaigns

---

## 🔧 CUSTOMIZATION OPTIONS

### Modify Social Scoring Logic:
Edit the "Social Media Scoring" node to adjust:
- Score thresholds
- Platform priorities
- Content types
- Urgency triggers

### Add More Platforms:
In each campaign node, add platforms to the arrays:
```javascript
"platforms": ["facebook", "instagram", "twitter", "linkedin", "tiktok"]
```

### Customize Messages:
Edit the creative content in each campaign node:
- Headlines
- Descriptions
- CTAs
- Hashtags

---

## 📋 TESTING CHECKLIST

- [ ] Metricool API credentials configured
- [ ] Route by Stage node modified with 5th output
- [ ] Connection established to Social Media Scoring
- [ ] Test data includes required fields
- [ ] BigQuery table `social_campaigns` exists
- [ ] Customer.io has social attributes defined
- [ ] Social webhooks endpoint configured

---

## 🚨 TROUBLESHOOTING

### If social flow doesn't trigger:
1. Check Route by Stage has the 5th output
2. Verify connection lines in n8n
3. Ensure journey_stage field exists

### If Metricool API fails:
1. Verify API key is correct
2. Check API rate limits
3. Ensure account has required permissions

### If data is missing:
1. Add console.log in Social Scoring node
2. Check data structure from master flow
3. Verify field names match exactly

---

## 💡 OPTIMIZATION TIPS

1. **Batch Processing**: Group users by journey stage before social processing
2. **Rate Limiting**: Add wait nodes between API calls if needed
3. **Caching**: Store social profiles to reduce API calls
4. **A/B Testing**: Create variant nodes for testing different messages
5. **Performance**: Run social flow asynchronously from main flow

---

## 📊 METRICS TO TRACK

Once integrated, monitor:
- Social campaign trigger rate by stage
- Platform performance by journey stage
- Influencer identification rate
- Social-to-conversion attribution
- Cost per social engagement
- Social ROI by platform