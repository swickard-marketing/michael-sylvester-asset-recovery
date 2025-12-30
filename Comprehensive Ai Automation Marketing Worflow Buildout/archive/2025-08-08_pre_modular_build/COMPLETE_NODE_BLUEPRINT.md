# Complete Customer Journey Workflow - Node Blueprint

## Overview
This document outlines every node required for the complete customer journey automation system integrating BigQuery, Customer.io, Twilio, Metricool, Wrike, DealerOn, and all supporting platforms.

---

## 1. TRIGGER NODES (Entry Points)

### 1.1 Main Schedule Trigger
- **Type**: `n8n-nodes-base.cron`
- **Purpose**: Daily batch processing of customer data
- **Parameters**:
  - Time: 2:00 AM EST (Awareness ETL)
  - Time: 9:00 AM EST (Consideration Nurture)
  - Time: 10:00 AM EST (Retention Check)
- **Why**: Processes accumulated data at optimal times for engagement

### 1.2 Intent Webhook Trigger
- **Type**: `n8n-nodes-base.webhook`
- **Purpose**: Real-time capture of high-intent events
- **Parameters**:
  - Path: `/events/intent`
  - Method: POST
  - Response: onReceived
- **Why**: Immediate response to customer actions like "schedule test drive"

### 1.3 Conversion Webhook Trigger
- **Type**: `n8n-nodes-base.webhook`
- **Purpose**: Real-time conversion event processing
- **Parameters**:
  - Path: `/events/conversion`
  - Method: POST
- **Why**: Instant lead processing for sales team

### 1.4 Social Media Webhook
- **Type**: `n8n-nodes-base.webhook`
- **Purpose**: Metricool event notifications
- **Parameters**:
  - Path: `/events/social`
- **Why**: Tracks social engagement for awareness stage

---

## 2. DATA COLLECTION NODES

### 2.1 BigQuery Master Query
- **Type**: `n8n-nodes-base.googleBigQuery`
- **Purpose**: Fetch all customer behavior data
- **Parameters**:
  ```sql
  SELECT user_id, email, phone, first_name, last_name,
         page_time_spent, viewed_financing_options, 
         form_submitted, vdp_views, source_channel,
         last_visit_date, session_id
  FROM `project.dataset.user_behavior`
  WHERE last_visit_date >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  ```
- **Why**: Central data source for all customer interactions

### 2.2 GA4 Analytics Fetch
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Get Google Analytics traffic data
- **Parameters**:
  - URL: `https://analyticsdata.googleapis.com/v1beta/properties/{{propertyId}}:runReport`
  - Dimensions: sessionDefaultChannelGroup, sessionSource, sessionMedium
  - Metrics: sessions, totalUsers, engagedSessions, bounceRate
- **Why**: Tracks awareness stage traffic sources

### 2.3 Google Ads Data
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Fetch Google Ads campaign performance
- **Parameters**:
  - URL: `https://googleads.googleapis.com/v15/customers/{{customerId}}/googleAds:searchStream`
  - Query: Campaign metrics, impressions, clicks, conversions
- **Why**: Measures paid search effectiveness

### 2.4 Facebook Ads Insights
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Get Facebook/Meta advertising data
- **Parameters**:
  - URL: `https://graph.facebook.com/v18.0/act_{{adAccountId}}/insights`
  - Fields: campaign_name, spend, impressions, clicks, reach
- **Why**: Tracks social advertising performance

### 2.5 Metricool Social Data
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Fetch social media engagement metrics
- **Parameters**:
  - URL: `https://api.metricool.com/v1/analytics`
  - Metrics: engagement_rate, post_reach, video_views, followers_growth
- **Why**: Monitors organic social performance

### 2.6 DealerOn Inventory Check
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Get current vehicle inventory
- **Parameters**:
  - URL: `https://api.dealeron.com/v1/inventory`
  - Fields: vehicle_id, model, availability, pricing
- **Why**: Matches customer interest with available inventory

---

## 3. DATA PROCESSING NODES

### 3.1 Journey Stage Classifier
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Determine customer's current journey stage
- **Logic**:
  ```javascript
  if (form_submitted) return 'conversion';
  if (viewed_financing_options && page_time > 60) return 'intent';
  if (page_time > 30) return 'consideration';
  return 'awareness';
  ```
- **Why**: Routes customers to appropriate campaigns

### 3.2 Intent Scoring Engine
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Calculate customer intent score (0-100)
- **Scoring Logic**:
  - Page time: 0-40 points
  - Financing views: +30 points
  - VDP views: +20 points
  - Form submission: +40 points
  - Test drive scheduled: +50 points
- **Why**: Prioritizes high-value leads

### 3.3 Segmentation Processor
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Assign customers to behavioral segments
- **Segments**:
  - High Intent (score 70+)
  - Medium Intent (score 40-69)
  - Low Intent (score <40)
- **Why**: Enables targeted messaging

### 3.4 Frequency Cap Calculator
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Prevent customer fatigue
- **Logic**:
  - High intent: Max 2 touches/week
  - Medium intent: Max 4 touches/week
  - Low intent: Max 6 touches/week
- **Why**: Maintains positive customer experience

### 3.5 JOMP Analysis Engine
- **Type**: `n8n-nodes-base.code`
- **Purpose**: AI-powered performance optimization
- **Analyzes**:
  - Conversion patterns
  - Channel effectiveness
  - Optimal timing
  - Message performance
- **Why**: Continuous improvement of campaigns

---

## 4. ROUTING NODES

### 4.1 Master Stage Router
- **Type**: `n8n-nodes-base.switch`
- **Purpose**: Route by journey stage
- **Outputs**:
  - 0: Awareness
  - 1: Consideration
  - 2: Intent
  - 3: Conversion
  - 4: Retention/Advocacy
- **Why**: Directs to stage-specific workflows

### 4.2 Intent Level Router
- **Type**: `n8n-nodes-base.switch`
- **Purpose**: Route by intent score
- **Outputs**:
  - 0: High Intent (70+)
  - 1: Medium Intent (40-69)
  - 2: Low Intent (<40)
- **Why**: Prioritizes resource allocation

### 4.3 Channel Router
- **Type**: `n8n-nodes-base.switch`
- **Purpose**: Route to preferred communication channel
- **Outputs**:
  - 0: Email (Customer.io)
  - 1: SMS (Twilio)
  - 2: Social (Metricool)
  - 3: Direct Mail
- **Why**: Respects customer preferences

### 4.4 Priority Filter
- **Type**: `n8n-nodes-base.filter`
- **Purpose**: Identify urgent actions
- **Conditions**:
  - Intent score >= 80
  - Event = "schedule_test_drive"
  - Event = "financing_application"
- **Why**: Ensures immediate response to hot leads

---

## 5. CUSTOMER.IO NODES

### 5.1 Profile Upsert
- **Type**: `n8n-nodes-base.customerIo`
- **Operation**: `upsert`
- **Purpose**: Create/update customer profiles
- **Attributes**:
  - journey_stage
  - intent_score
  - intent_level
  - last_engagement
  - vehicle_interest
  - communication_preference
- **Why**: Maintains unified customer view

### 5.2 Event Tracking
- **Type**: `n8n-nodes-base.customerIo`
- **Operation**: `track`
- **Purpose**: Record customer actions
- **Events**:
  - journey_stage_change
  - intent_signal_detected
  - conversion_completed
  - retention_triggered
- **Why**: Triggers automated campaigns

### 5.3 Segment Assignment
- **Type**: `n8n-nodes-base.customerIo`
- **Operation**: `segment.add`
- **Purpose**: Add customers to behavioral segments
- **Segments**:
  - high_intent_active
  - medium_intent_nurture
  - conversion_ready
  - retention_risk
- **Why**: Enables targeted campaigns

### 5.4 Campaign Trigger
- **Type**: `n8n-nodes-base.customerIo`
- **Operation**: `campaign.trigger`
- **Purpose**: Launch specific campaigns
- **Campaigns**:
  - welcome_series
  - consideration_nurture
  - abandoned_cart
  - win_back
- **Why**: Automated marketing sequences

---

## 6. TWILIO SMS NODES

### 6.1 High Intent SMS
- **Type**: `n8n-nodes-base.twilio`
- **Purpose**: Immediate SMS for hot leads
- **Message Templates**:
  - Test drive confirmation
  - Quote ready notification
  - Special offer alert
- **Why**: Real-time engagement

### 6.2 Service Reminder SMS
- **Type**: `n8n-nodes-base.twilio`
- **Purpose**: Retention stage reminders
- **Messages**:
  - Service due reminders
  - Lease end notifications
  - Loyalty rewards
- **Why**: Maintains customer relationship

### 6.3 SMS Opt-out Handler
- **Type**: `n8n-nodes-base.twilio`
- **Purpose**: Process STOP requests
- **Actions**:
  - Update Customer.io preference
  - Log to BigQuery
  - Remove from SMS segments
- **Why**: Compliance and preference management

---

## 7. METRICOOL SOCIAL NODES

### 7.1 Social Post Scheduler
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Schedule social media posts
- **Endpoints**:
  - POST `/v1/posts/schedule`
- **Platforms**: Facebook, Instagram, Twitter, LinkedIn
- **Why**: Maintains social presence

### 7.2 Social Engagement Monitor
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Track social interactions
- **Metrics**:
  - Comments, likes, shares
  - Mentions, hashtags
  - DM inquiries
- **Why**: Identifies social leads

### 7.3 Social Ad Campaign
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Launch retargeting ads
- **Targeting**:
  - Website visitors
  - Email list matches
  - Lookalike audiences
- **Why**: Multi-channel retargeting

---

## 8. CRM INTEGRATION NODES

### 8.1 Lead Creation
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Create CRM leads
- **Endpoint**: `POST /api/leads`
- **Data**:
  - Contact info
  - Lead score
  - Source attribution
  - Vehicle interest
- **Why**: Sales team notification

### 8.2 Lead Assignment
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Assign to sales rep
- **Logic**:
  - Round-robin for medium intent
  - Top performers for high intent
  - Territory-based assignment
- **Why**: Optimal lead distribution

### 8.3 Activity Logging
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Log all interactions
- **Activities**:
  - Email opens/clicks
  - Website visits
  - Phone calls
  - Test drives
- **Why**: Complete interaction history

---

## 9. WRIKE PROJECT NODES

### 9.1 Task Creation
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Create follow-up tasks
- **Endpoint**: `POST /api/v4/tasks`
- **Task Types**:
  - Follow-up calls
  - Email campaigns
  - Document preparation
- **Why**: Team coordination

### 9.2 Status Updates
- **Type**: `n8n-nodes-base.httpRequest`
- **Purpose**: Update task progress
- **Statuses**:
  - New, In Progress, Completed
  - Blocked, Cancelled
- **Why**: Workflow visibility

---

## 10. DATA WAREHOUSE NODES

### 10.1 BigQuery Event Logger
- **Type**: `n8n-nodes-base.googleBigQuery`
- **Operation**: `insert`
- **Purpose**: Log all events
- **Tables**:
  - journey_events
  - conversion_events
  - retention_campaigns
  - frequency_caps
- **Why**: Historical analysis

### 10.2 BigQuery Analytics Query
- **Type**: `n8n-nodes-base.googleBigQuery`
- **Operation**: `executeQuery`
- **Purpose**: Generate reports
- **Reports**:
  - Daily performance
  - Channel attribution
  - Conversion funnel
  - ROI analysis
- **Why**: Performance measurement

### 10.3 BigQuery ML Predictions
- **Type**: `n8n-nodes-base.googleBigQuery`
- **Purpose**: Predictive scoring
- **Models**:
  - Conversion probability
  - Churn risk
  - Lifetime value
- **Why**: Proactive engagement

---

## 11. ERROR HANDLING NODES

### 11.1 Error Catcher
- **Type**: `n8n-nodes-base.errorTrigger`
- **Purpose**: Catch workflow errors
- **Actions**:
  - Log error details
  - Send alert notification
  - Retry failed operations
- **Why**: Reliability

### 11.2 Data Validator
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Validate data quality
- **Checks**:
  - Required fields present
  - Email format valid
  - Phone number format
  - Duplicate detection
- **Why**: Data integrity

### 11.3 Fallback Handler
- **Type**: `n8n-nodes-base.switch`
- **Purpose**: Handle edge cases
- **Scenarios**:
  - Missing email → Use phone
  - API failure → Queue for retry
  - Rate limit → Delay execution
- **Why**: Graceful degradation

---

## 12. NOTIFICATION NODES

### 12.1 Slack Alerts
- **Type**: `n8n-nodes-base.slack`
- **Purpose**: Team notifications
- **Alerts**:
  - High-value lead detected
  - Campaign performance
  - System errors
  - Daily summaries
- **Why**: Team awareness

### 12.2 Email Reports
- **Type**: `n8n-nodes-base.emailSend`
- **Purpose**: Executive reporting
- **Reports**:
  - Daily performance
  - Weekly summaries
  - Monthly analytics
- **Why**: Stakeholder updates

---

## 13. TIMING CONTROL NODES

### 13.1 Wait Node
- **Type**: `n8n-nodes-base.wait`
- **Purpose**: Delay execution
- **Use Cases**:
  - Rate limiting
  - Scheduled sends
  - Follow-up timing
- **Why**: Optimal timing

### 13.2 Batch Processor
- **Type**: `n8n-nodes-base.splitInBatches`
- **Purpose**: Process in chunks
- **Parameters**:
  - Batch size: 100
  - Reset after: false
- **Why**: Performance optimization

---

## 14. COMPLIANCE NODES

### 14.1 Consent Checker
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Verify opt-in status
- **Checks**:
  - Email consent
  - SMS consent
  - Cookie consent
- **Why**: GDPR/CCPA compliance

### 14.2 Suppression List
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Honor opt-outs
- **Actions**:
  - Check suppression list
  - Update preferences
  - Remove from campaigns
- **Why**: Legal compliance

---

## 15. TESTING & QA NODES

### 15.1 Test Data Generator
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Create test records
- **Data Types**:
  - Test customers
  - Mock events
  - Sample scores
- **Why**: Workflow testing

### 15.2 Debug Logger
- **Type**: `n8n-nodes-base.code`
- **Purpose**: Log execution details
- **Logs**:
  - Input/output data
  - Execution time
  - Memory usage
- **Why**: Troubleshooting

---

## COMPLETE WORKFLOW SEQUENCE

### Stage 1: Data Collection (Nodes 1-6)
1. Triggers fire (cron/webhook)
2. Fetch from all data sources
3. Combine and normalize data

### Stage 2: Processing (Nodes 7-10)
1. Calculate journey stage
2. Score intent level
3. Determine segments
4. Check frequency caps

### Stage 3: Routing (Nodes 11-14)
1. Route by stage
2. Route by intent
3. Route by channel
4. Filter priorities

### Stage 4: Customer.io Updates (Nodes 15-18)
1. Update profiles
2. Track events
3. Assign segments
4. Trigger campaigns

### Stage 5: Multi-Channel Messaging (Nodes 19-25)
1. Send priority SMS (Twilio)
2. Schedule social posts (Metricool)
3. Update CRM records
4. Create Wrike tasks

### Stage 6: Analytics & Logging (Nodes 26-30)
1. Log to BigQuery
2. Run JOMP analysis
3. Generate reports
4. Send notifications

### Stage 7: Error Handling (Nodes 31-33)
1. Catch errors
2. Validate data
3. Handle fallbacks

---

## PLATFORM CREDENTIALS REQUIRED

1. **BigQuery**: OAuth2 for data warehouse
2. **Customer.io**: API key for marketing automation
3. **Twilio**: Account SID & Auth Token for SMS
4. **Metricool**: API key for social media
5. **Google Analytics**: OAuth2 for GA4
6. **Google Ads**: Developer token & OAuth2
7. **Facebook**: OAuth2 for ads & pages
8. **Wrike**: API token for project management
9. **DealerOn**: API key for inventory
10. **CRM**: API credentials for lead management
11. **Slack**: Webhook URL for notifications
12. **SMTP**: Email server for reports

---

## ESTIMATED NODE COUNT

- **Triggers**: 4 nodes
- **Data Collection**: 6 nodes
- **Processing**: 5 nodes
- **Routing**: 4 nodes
- **Customer.io**: 4 nodes
- **Twilio**: 3 nodes
- **Metricool**: 3 nodes
- **CRM**: 3 nodes
- **Wrike**: 2 nodes
- **BigQuery**: 3 nodes
- **Error Handling**: 3 nodes
- **Notifications**: 2 nodes
- **Utilities**: 4 nodes

**Total: ~46 nodes for complete workflow**

---

## IMPLEMENTATION PRIORITY

### Phase 1: Core Journey (Week 1)
- BigQuery data collection
- Journey stage classification
- Customer.io profile updates
- Basic segmentation

### Phase 2: Messaging (Week 2)
- Twilio SMS integration
- Customer.io campaigns
- Priority routing
- Frequency capping

### Phase 3: Analytics (Week 3)
- JOMP analysis
- BigQuery logging
- Performance reports
- Slack notifications

### Phase 4: Advanced Features (Week 4)
- Metricool social integration
- CRM synchronization
- Wrike task management
- Predictive scoring

### Phase 5: Optimization (Ongoing)
- A/B testing
- Performance tuning
- Error handling refinement
- Compliance updates

---

## SUCCESS METRICS

1. **Processing Speed**: <5 seconds per record
2. **Error Rate**: <1% of executions
3. **Delivery Rate**: >95% successful sends
4. **Engagement Rate**: >30% open rate
5. **Conversion Rate**: >5% lead-to-sale
6. **ROI**: 10:1 marketing spend return

---

## NOTES

- All nodes should include error outputs
- Use expressions for dynamic values: `={{ $json.field }}`
- Test with small batches before full deployment
- Monitor API rate limits for all platforms
- Implement gradual rollout for new features
- Document all custom code functions
- Version control workflow exports
- Schedule regular performance reviews