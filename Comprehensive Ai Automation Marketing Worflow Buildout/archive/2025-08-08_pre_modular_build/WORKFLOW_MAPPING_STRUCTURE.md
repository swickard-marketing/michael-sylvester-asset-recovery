# Complete Marketing System - Workflow Mapping Structure

## Current Production Workflows (Skeletal)

### 1. DealerOn Integration Workflow
**File:** `dealeron_complete_workflow.json`
**Nodes:** 6
- **Schedule Trigger:** Cron (6AM, 12PM, 6PM PST)
- **DealerOn Inventory Sync:** Consolidated Code node
- **BannerInSite Automation:** Consolidated Code node
- **Customer.io Update:** Customer profile updates
- **BigQuery Logger:** Data warehouse logging
- **Documentation:** Sticky note with workflow details

**Data Flow:**
```
Schedule → Inventory Sync → Banner Creation → Customer Updates → Data Logging
```

### 2. Awareness Stage Workflow
**File:** `awareness_stage_workflow.json`
**Nodes:** 6
- **Webhook Trigger:** `/awareness` endpoint
- **Awareness Processor:** Consolidated Code node (7 segments)
- **Customer.io Campaign:** Campaign triggering
- **Metricool Social:** Social media distribution
- **BigQuery Logger:** Campaign logging
- **Documentation:** Sticky note with stage details

**Data Flow:**
```
Webhook → Processing → Email Campaigns → Social Distribution → Data Logging
```

### 3. Consideration Stage Workflow
**File:** `consideration_stage_workflow.json`
**Nodes:** 5
- **Schedule Trigger:** 3x daily (9AM, 2PM, 7PM)
- **Consideration Processor:** Consolidated Code node (lead scoring)
- **Customer.io Segment:** Segment management
- **Wrike Tasks:** Sales task creation
- **BigQuery Logger:** Nurture tracking

**Data Flow:**
```
Schedule → Lead Scoring → Segmentation → Task Creation → Data Logging
```

## Data Mapping Consistency

### Standard Contact Object Structure
All workflows use consistent contact data structure:

```javascript
{
  // Core Identity
  id: string,
  email: string,
  phone: string,
  name: string,
  
  // Demographics
  age: number,
  age_group: string, // gen_z, millennial, gen_x, boomer
  income: number,
  income_bracket: string, // budget, moderate, comfortable, affluent
  location_type: string, // urban, suburban, rural
  zip: string,
  
  // Behavioral Tracking
  digital_presence: number, // 0-100 score
  engagement_potential: number, // 0-100 score
  channel_preference: string, // email, sms, social, multi
  previous_visits: number,
  days_since_last_visit: number,
  content_views: number,
  
  // Vehicle Preferences
  vehicle_segment: string, // luxury, truck, suv, ev, sedan
  budget_range: { min: number, max: number },
  purchase_timeline: string, // 0-30, 30-60, 60-90, 90+ days
  preferred_makes: array,
  preferred_types: array,
  
  // Journey Stage
  current_stage: string, // awareness, consideration, intent, conversion, retention
  stage_entry: timestamp,
  lead_score: number, // 0-100
  lead_temperature: string, // cold, warm, hot
  
  // Marketing
  touchpoints: array,
  last_interaction: timestamp,
  campaigns: array,
  segment_ids: array
}
```

### Platform Integration Mapping

#### Customer.io Fields
```
customer_id → contact.id
email → contact.email
attributes.stage → contact.current_stage
attributes.score → contact.lead_score
attributes.segment → contact.segment_ids
```

#### Twilio Fields
```
to → contact.phone
from → config.twilio.from
body → campaign.content.sms_message
statusCallback → webhook for delivery tracking
```

#### Metricool Fields
```
campaign_name → campaign.id
platforms → ['facebook', 'instagram']
audience → segment.contacts
content → campaign.content.social_posts
```

#### BigQuery Schema
```sql
-- Contacts Table
contact_id STRING
email STRING
stage STRING
lead_score INT64
segment_ids ARRAY<STRING>
last_updated TIMESTAMP

-- Campaigns Table
campaign_id STRING
stage STRING
segment_id STRING
channel ARRAY<STRING>
status STRING
created_at TIMESTAMP

-- Events Table
event_id STRING
contact_id STRING
campaign_id STRING
event_type STRING
event_data JSON
timestamp TIMESTAMP
```

#### DealerOn/Dealer.com Fields
```
inventory.vin → vehicle.vin
inventory.stock_number → vehicle.stock_id
inventory.price → vehicle.price
inventory.make → vehicle.make
inventory.model → vehicle.model
inventory.year → vehicle.year
```

## Workflow Connection Points

### Stage Progression Logic
```
Awareness → Consideration: lead_score >= 30 OR engagement_signals >= 3
Consideration → Intent: lead_score >= 75 OR test_drive_request = true
Intent → Conversion: quote_requested = true OR finance_application = true
Conversion → Retention: purchase_completed = true
```

### Cross-Workflow Data Sharing
- All workflows write to same BigQuery dataset
- Contact ID used as primary key across all systems
- Stage transitions tracked in events table
- Campaign performance aggregated hourly

## Required Improvements for Consistency

1. **Standardize Error Handling**
   - Add consistent error objects across all Code nodes
   - Implement retry logic for API failures
   - Log all errors to BigQuery error table

2. **Unify Configuration Management**
   - Move all API keys to n8n credentials
   - Use environment variables for dataset names
   - Standardize webhook URL patterns

3. **Normalize Output Format**
   - All Code nodes should output same structure
   - Include metadata in every output (timestamp, stage, version)
   - Consistent naming conventions for output types

4. **Add Missing Validations**
   - Phone number validation before Twilio sends
   - Email validation before Customer.io updates
   - Budget range validation for vehicle matching

## Next Steps for Complete Mapping

### Remaining Workflows Needed:
1. **Intent Stage** - Test drive scheduling, quote generation
2. **Conversion Stage** - Finance applications, purchase processing
3. **Retention Stage** - Service reminders, loyalty programs
4. **Master Orchestrator** - Stage routing and coordination

### Critical Data Mappings Still Required:
- Wrike task fields to contact activities
- BannerInSite campaign IDs to inventory items
- JOMP AI decisions to journey progression
- Website behavior to contact enrichment