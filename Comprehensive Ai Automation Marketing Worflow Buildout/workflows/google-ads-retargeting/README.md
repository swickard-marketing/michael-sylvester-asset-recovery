# Google Ads Dynamic Retargeting Workflow

## Overview
This n8n workflow automatically manages Google Ads budgets and creates retargeting campaigns for prospects who haven't converted to paying customers (vehicle sales OR service).

## File Structure
- `google_ads_dynamic_retargeting.json` - Main n8n workflow file
- `prospect_status_mapping.sql` - SQL logic for lead temperature classification
- `README_google_ads_dynamic_retargeting.md` - This documentation file

## Workflow Components

### 1. Schedule Trigger
- **Frequency**: Runs every hour
- **Purpose**: Continuously optimize budgets and identify new retargeting opportunities

### 2. Data Sources

#### Prospects Data (BigQuery)
Pulls from three tables based on actual CSV structure:
- `marketing.prospects` - Lead submissions from Mercedes-Benz/Lexus/Toyota
- `marketing.sales` - Completed vehicle sales
- `marketing.service` - Service customers (also revenue generators)

#### Key Fields Used:
```
Client_Email - Primary identifier
Prospect_Status - Determines lead temperature
Prospect_Status_Type - Open/Closed/Sold
Desired_Make/Model - Vehicle interest
Trade_Make/Model - Trade-in information
Prospect_Created_Date - Lead age calculation
```

### 3. Lead Temperature Classification

Based on actual Mercedes-Benz Seattle data:

#### HOT LEADS 🔥 (2.0-2.5x budget multiplier)
- `***HOT PROSPECT` - Explicitly marked
- `Working` - Active engagement
- `Appointment Set` - Scheduled visit
- `Appointment Shown` - Visited dealership
- `Manager Review` - High priority
- `Sold - Deposit Taken` - Money down

#### WARM LEADS 🌡️ (1.2-1.5x budget multiplier)
- `***MEDIUM PROSPECT` - Explicitly marked
- `New` - Fresh leads
- `Rep Engaged - No BDC Call` - Initial contact
- `Service` - Service customer interested in sales
- `KBB ICO - Working` - Trade evaluation

#### COLD LEADS ❄️ (1.0x budget multiplier)
- `**COLD PROSPECT` - Explicitly marked
- `Non-Responsive C/O` - Stopped responding
- `Appointment Missed/Canceled` - No-show
- `Not in Market C/O` - Not ready
- `Unable to Obtain Financing C/O` - Credit issues

#### DISQUALIFIED ❌ (No retargeting)
- `Sold - Integration` - Already purchased
- `Bought Elsewhere` - Lost sale
- `Opted-Out of All Comm C/O` - Do not contact
- `Dead`, `Duplicate`, `Bad Lead` - Invalid

### 4. Retargeting Strategies

The workflow creates specialized campaigns based on prospect status:

| Status | Campaign Strategy | Focus |
|--------|------------------|-------|
| Appointment Missed/Canceled | Reschedule Campaign | "We're still holding your spot" |
| Unable to Obtain Financing | Alternative Financing | "Special financing available" |
| Service Status | Service-to-Sales | "Upgrade from service to sales" |
| Out-of-State | Remote Buyer | "We ship nationwide" |
| Non-Responsive C/O | Win-Back | "We miss you" messaging |
| Working | Nurture | Continue engagement |

### 5. Budget Allocation

#### Daily Budget Settings:
- **Total Daily Budget**: $5,000
- **Minimum per Campaign**: $50
- **Maximum per Campaign**: $1,000
- **CPA Target**: $500
- **Auto-Pause Threshold**: CPA > $1,000

#### Dynamic Adjustments:
```javascript
// Budget calculation logic
Hot Lead + Recent (< 3 days) = 2.5x multiplier
Hot Lead = 2.0x multiplier
Warm Lead + Recent (< 7 days) = 1.5x multiplier
Warm Lead = 1.2x multiplier
Cold Lead = 1.0x multiplier
Service-to-Sales = 1.8x multiplier (highest conversion rate)
```

### 6. Safety Mechanisms

1. **Budget Caps**
   - Max daily increase: 50%
   - Max daily decrease: 30%
   - Weekly budget cap: $35,000

2. **Performance Monitoring**
   - Pause campaigns with CPA > $1,000
   - Reduce budget if conversion rate < 0.1%
   - Require manual approval for changes > $500

3. **Email Alerts**
   - Sent to marketing-manager@dealership.com
   - Triggered for budget changes > $500
   - Include performance metrics and reasoning

### 7. Ad Messaging Templates

#### Hot Retargeting:
- Headlines: "Still interested in {{Desired_Model}}?"
- Description: "Your {{Desired_Make}} is waiting"

#### Service-to-Sales:
- Headlines: "Time to upgrade your {{Vehicle_Model}}?"
- Description: "Service customers get exclusive pricing"

#### Financing Issues:
- Headlines: "Alternative financing now available"
- Description: "Bad credit? No problem. We have options"

## Configuration Required

### 1. BigQuery Setup
```sql
-- Required tables:
marketing.prospects (from CSV imports)
marketing.sales (from CSV imports)
marketing.service (from CSV imports)
marketing.google_ads_performance (for optimization)
marketing.budget_adjustments (for logging)
```

### 2. Credentials Needed
- **BigQuery OAuth** - Access to marketing dataset
- **Google Ads OAuth** - Campaign management permissions
- **SMTP** - For alert emails

### 3. Google Ads API Scopes
```
https://www.googleapis.com/auth/adwords
- Campaign management
- Budget management
- Audience management
- Reporting access
```

## Performance Metrics

### Primary KPIs:
- **Cost Per Acquisition (CPA)**: Target < $500
- **Conversion Rate**: Target > 2%
- **Return on Ad Spend (ROAS)**: Target > 4.0x

### Tracking by Segment:
- Hot leads: Expect 5-8% conversion
- Warm leads: Expect 2-4% conversion
- Cold leads: Expect 0.5-1% conversion
- Service-to-Sales: Expect 3-5% conversion

## Troubleshooting

### Common Issues:

1. **"No prospects found"**
   - Check BigQuery table names
   - Verify date ranges in SQL
   - Ensure consent fields = 'Y'

2. **"Budget not updating"**
   - Verify Google Ads API credentials
   - Check campaign name matching
   - Review safety threshold settings

3. **"Too many campaigns paused"**
   - Lower CPA threshold from $1,000
   - Increase minimum impressions before decisions
   - Review conversion tracking setup

## Maintenance Schedule

### Daily:
- Review email alerts for major changes
- Check paused campaigns

### Weekly:
- Analyze segment performance
- Adjust multipliers if needed
- Review CPA trends

### Monthly:
- Full performance audit
- Update status mappings if CRM changes
- Adjust total budget allocation

## Version History

- **v1.0** (2025-01-08): Initial implementation
  - Basic retargeting with hot/warm/cold segments
  - Dynamic budget allocation
  - Safety mechanisms

## Contact

For questions or modifications:
- Technical: n8n administrator
- Strategy: Marketing Manager
- Budget Approval: General Manager

## Related Documentation

- [Google Ads API Documentation](https://developers.google.com/google-ads/api/docs/start)
- [BigQuery SQL Reference](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
- [n8n Google Ads Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.googleads/)

---
*Last Updated: 2025-01-08*