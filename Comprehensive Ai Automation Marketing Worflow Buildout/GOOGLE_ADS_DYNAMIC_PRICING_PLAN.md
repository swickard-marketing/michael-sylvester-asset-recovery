# Google Ads Dynamic Pricing Workflow Plan

## Overview
Create an n8n workflow that dynamically adjusts Google Ads spend based on real-time funnel metrics, inventory needs, customer engagement patterns, and **retargets recent lead submissions who didn't convert to sold customers**.

## Existing Budget Logic Found in Archives

From `awareness_stage_workflow.json`:
```javascript
function calculateDisplayBudget(campaign) {
  const base = 200;
  const perContact = 0.3;
  const priorityMultiplier = campaign.priority === 'high' ? 1.5 : 1;
  return (base + (campaign.contact_count * perContact)) * priorityMultiplier;
}
```

This basic logic needs enhancement to include:
- Funnel conversion metrics
- Inventory aging factors
- ROI tracking
- Competitive positioning

## Proposed Enhanced Architecture

### 1. Data Inputs (From BigQuery + Live Data)

Based on actual CSV data structure from Mercedes-Benz/Lexus/Toyota:

```sql
-- Non-Converted Prospects Query (From Prospects CSV)
WITH unconverted_prospects AS (
  SELECT 
    Client_Email as email,
    Client_Cell as phone,
    Client_First_Name as first_name,
    Client_Last_Name as last_name,
    Prospect_Created_Date as lead_date,
    Prospect_Status,
    Desired_Make as interest_make,
    Desired_Model as interest_model,
    Desired_Year as interest_year,
    Trade_Make,
    Trade_Model,
    DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Created_Date, DAY) as days_since_lead
  FROM marketing.prospects
  WHERE Prospect_Status NOT IN ('Sold - Integration', 'Sold')
    AND Prospect_Status_Type NOT IN ('Duplicate', 'Closed')
    AND DATE(Prospect_Created_Date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
    AND Dealer_Contact_Consent_for_Email = 'Y'
),

-- Paying Customers Query (Sales + Service = Revenue Generated)
paying_customers AS (
  -- New and Pre-owned Car Sales
  SELECT 
    Client_Email as email,
    Sales_Deal_Date as transaction_date,
    'vehicle_sale' as transaction_type,
    Vehicle_Make as make,
    Vehicle_Model as model
  FROM marketing.sales
  WHERE DATE(Sales_Deal_Date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY)
  
  UNION ALL
  
  -- Service Customers (Also paying customers!)
  SELECT 
    Client_Email as email,
    CS_RO_Date as transaction_date,
    'service' as transaction_type,
    Vehicle_Make as make,
    Vehicle_Model as model
  FROM marketing.service
  WHERE DATE(CS_RO_Date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
    AND CS_Rec_Service_Accept = 'Y'  -- Accepted recommended service
),

-- Service Customers Query (From Service CSV)
service_customers AS (
  SELECT 
    Client_Email as email,
    CS_RO_Date as last_service_date,
    Vehicle_Make,
    Vehicle_Model,
    Vehicle_Year,
    Vehicle_Last_RO_Mileage as mileage
  FROM marketing.service
  WHERE DATE(CS_RO_Date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 180 DAY)
)

-- Identify Retargeting Candidates (Prospects who haven't made ANY purchase/service)
SELECT 
  p.*,
  pc.transaction_date as last_transaction,
  pc.transaction_type,
  CASE 
    WHEN pc.email IS NOT NULL THEN 'existing_customer_upsell'
    WHEN p.days_since_lead < 7 THEN 'hot_retarget'
    WHEN p.days_since_lead < 30 THEN 'warm_retarget'
    WHEN p.days_since_lead < 60 THEN 'cool_retarget'
    ELSE 'win_back'
  END as retarget_segment,
  CASE
    WHEN p.Desired_Make IN ('Mercedes-Benz', 'Lexus') THEN 'luxury'
    WHEN p.Desired_Make IN ('Toyota', 'Honda') THEN 'value'
    WHEN p.Desired_Make LIKE '%TRUCK%' OR p.Desired_Model LIKE '%SPRINTER%' THEN 'commercial'
    ELSE 'general'
  END as audience_type,
  CASE
    WHEN pc.transaction_type = 'service' THEN 'service_to_sales'
    WHEN pc.transaction_type = 'vehicle_sale' THEN 'repeat_buyer'
    ELSE 'new_prospect'
  END as customer_journey_type
FROM unconverted_prospects p
LEFT JOIN paying_customers pc ON p.email = pc.email
WHERE (pc.email IS NULL  -- Never bought anything
   OR (pc.transaction_type = 'service' 
       AND p.Desired_Make IS NOT NULL))  -- Service customer interested in sales
```

### 2. Dynamic Pricing Algorithm

```javascript
function calculateDynamicGoogleAdBudget(metrics) {
  const budget = {
    campaign_id: metrics.campaign_id,
    current_budget: metrics.current_daily_budget,
    recommended_budget: 0,
    adjustment_reason: [],
    roi_score: 0,
    urgency_multiplier: 1
  };
  
  // Base budget calculation
  let newBudget = metrics.current_daily_budget;
  
  // Factor 1: Conversion Rate Performance
  const conversionRate = metrics.conversions / metrics.impressions;
  const targetConversionRate = 0.02; // 2% baseline
  
  if (conversionRate > targetConversionRate * 1.5) {
    newBudget *= 1.3; // Increase 30% for high performers
    budget.adjustment_reason.push('High conversion rate');
  } else if (conversionRate < targetConversionRate * 0.5) {
    newBudget *= 0.7; // Decrease 30% for poor performers
    budget.adjustment_reason.push('Low conversion rate');
  }
  
  // Factor 2: Cost Per Acquisition (CPA)
  const currentCPA = metrics.total_spend / metrics.conversions;
  const targetCPA = 500; // $500 target CPA
  
  if (currentCPA < targetCPA * 0.8) {
    newBudget *= 1.2; // Profitable - increase spend
    budget.adjustment_reason.push('CPA below target');
  } else if (currentCPA > targetCPA * 1.2) {
    newBudget *= 0.8; // Too expensive - reduce spend
    budget.adjustment_reason.push('CPA above target');
  }
  
  // Factor 3: Inventory Urgency
  if (metrics.aged_inventory_days > 60) {
    budget.urgency_multiplier = 1.4;
    budget.adjustment_reason.push('Aged inventory push');
  } else if (metrics.aged_inventory_days > 90) {
    budget.urgency_multiplier = 1.7;
    budget.adjustment_reason.push('Critical inventory clearance');
  }
  
  // Factor 4: Funnel Stage Performance
  const stageMultipliers = {
    awareness: metrics.awareness_to_consideration_rate > 0.3 ? 1.2 : 0.9,
    consideration: metrics.consideration_to_intent_rate > 0.4 ? 1.3 : 0.8,
    intent: metrics.intent_to_conversion_rate > 0.5 ? 1.5 : 0.7
  };
  
  newBudget *= stageMultipliers[metrics.stage] || 1;
  
  // Factor 5: Day of Week & Time Optimization
  const dayPerformance = {
    monday: 0.9,
    tuesday: 1.0,
    wednesday: 1.1,
    thursday: 1.2,
    friday: 1.3,
    saturday: 1.4,
    sunday: 0.8
  };
  
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'lowercase' });
  newBudget *= dayPerformance[currentDay];
  
  // Apply urgency multiplier
  newBudget *= budget.urgency_multiplier;
  
  // Set budget caps
  const MIN_BUDGET = 50;  // $50 minimum
  const MAX_BUDGET = 5000; // $5000 maximum
  budget.recommended_budget = Math.min(MAX_BUDGET, Math.max(MIN_BUDGET, newBudget));
  
  // Calculate ROI score
  budget.roi_score = (metrics.total_revenue / metrics.total_spend) * 100;
  
  return budget;
}
```

### 3. Retargeting Campaign Creation

```javascript
// Create retargeting audiences based on prospect data
function createRetargetingCampaigns(prospects) {
  const campaigns = {
    hot_leads: {
      name: 'Hot Lead Retargeting - 7 Days',
      audience: prospects.filter(p => p.retarget_segment === 'hot_retarget'),
      budget_multiplier: 2.0, // Double budget for hot leads
      bid_strategy: 'maximize_conversions',
      ad_messaging: {
        headlines: [
          'Still interested in {{Desired_Model}}?',
          'Your {{Desired_Make}} is waiting',
          'Special offer expires soon'
        ],
        descriptions: [
          'Complete your purchase today and save',
          'Exclusive pricing for returning customers',
          'We have your {{Desired_Model}} in stock'
        ]
      },
      frequency_cap: 5 // Show 5x per day max
    },
    
    warm_leads: {
      name: 'Warm Lead Nurture - 30 Days',
      audience: prospects.filter(p => p.retarget_segment === 'warm_retarget'),
      budget_multiplier: 1.5,
      bid_strategy: 'target_cpa',
      ad_messaging: {
        headlines: [
          'New incentives on {{Desired_Make}}',
          'Trade-in values increased',
          'Limited time financing available'
        ],
        descriptions: [
          'Get more for your {{Trade_Make}} trade-in',
          '0% APR financing now available',
          'Schedule a test drive today'
        ]
      },
      frequency_cap: 3
    },
    
    cool_leads: {
      name: 'Cool Lead Re-engagement - 60 Days',
      audience: prospects.filter(p => p.retarget_segment === 'cool_retarget'),
      budget_multiplier: 1.0,
      bid_strategy: 'target_roas',
      ad_messaging: {
        headlines: [
          'We miss you at {{Business_Unit_Name}}',
          'New inventory just arrived',
          'Special comeback offer'
        ],
        descriptions: [
          '$500 additional discount for returning customers',
          'See what\'s new in our showroom',
          'Your perfect car might be here'
        ]
      },
      frequency_cap: 2
    },
    
    service_to_sales: {
      name: 'Service Customer Vehicle Upgrade',
      audience: prospects.filter(p => p.customer_journey_type === 'service_to_sales'),
      budget_multiplier: 1.8, // Higher value - existing relationship
      bid_strategy: 'target_cpa',
      ad_messaging: {
        headlines: [
          'Time to upgrade your {{Vehicle_Model}}?',
          'Exclusive offer for service customers',
          'Your loyalty pays off - Save more'
        ],
        descriptions: [
          'As a valued service customer, enjoy special pricing',
          'Skip the negotiation - VIP pricing ready',
          'Your service history = Extra trade value'
        ]
      },
      frequency_cap: 3
    },
    
    service_retention: {
      name: 'Service Due Reminders',
      audience: service_customers.filter(c => {
        const daysSinceService = Math.floor((Date.now() - c.last_service_date) / (1000 * 60 * 60 * 24));
        return daysSinceService > 90; // 3+ months since service
      }),
      budget_multiplier: 0.8, // Lower cost, high value
      bid_strategy: 'target_cpa',
      ad_messaging: {
        headlines: [
          'Time for your {{Vehicle_Make}} service',
          'Keep your warranty valid',
          'Quick service appointment available'
        ],
        descriptions: [
          'Book online and save 10%',
          'Express service - done in 1 hour',
          'Free multi-point inspection included'
        ]
      },
      frequency_cap: 2
    }
  };
  
  return campaigns;
}

// Dynamic budget allocation based on retargeting performance
function allocateRetargetingBudget(campaigns, totalBudget) {
  const performance = {};
  let totalScore = 0;
  
  // Calculate performance scores
  campaigns.forEach(campaign => {
    const score = calculateCampaignScore(campaign);
    performance[campaign.name] = score;
    totalScore += score;
  });
  
  // Allocate budget proportionally
  const allocations = {};
  campaigns.forEach(campaign => {
    const percentage = performance[campaign.name] / totalScore;
    allocations[campaign.name] = {
      daily_budget: totalBudget * percentage * campaign.budget_multiplier,
      audience_size: campaign.audience.length,
      cost_per_person: (totalBudget * percentage) / campaign.audience.length
    };
  });
  
  return allocations;
}

function calculateCampaignScore(campaign) {
  let score = 100;
  
  // Recency bonus
  if (campaign.name.includes('Hot')) score *= 1.5;
  else if (campaign.name.includes('Warm')) score *= 1.2;
  
  // Audience size factor
  score *= Math.log10(campaign.audience.length + 10);
  
  // Luxury segment bonus
  const luxuryCount = campaign.audience.filter(p => 
    p.audience_type === 'luxury'
  ).length;
  score *= (1 + luxuryCount / campaign.audience.length * 0.3);
  
  return score;
}
```

### 4. Campaign-Specific Adjustments

```javascript
// Different strategies for different campaign types
const campaignStrategies = {
  brand_awareness: {
    focus: 'impressions',
    bid_strategy: 'maximize_reach',
    budget_allocation: {
      search: 0.3,
      display: 0.5,
      video: 0.2
    }
  },
  inventory_clearance: {
    focus: 'conversions',
    bid_strategy: 'target_cpa',
    budget_allocation: {
      search: 0.6,
      shopping: 0.3,
      display: 0.1
    }
  },
  service_promotion: {
    focus: 'calls',
    bid_strategy: 'maximize_conversions',
    budget_allocation: {
      search: 0.7,
      call_only: 0.3
    }
  },
  model_launch: {
    focus: 'engagement',
    bid_strategy: 'target_impression_share',
    budget_allocation: {
      search: 0.4,
      display: 0.3,
      video: 0.3
    }
  }
};
```

### 5. Enhanced N8N Workflow with Retargeting

```json
{
  "name": "Google Ads Dynamic Pricing Controller",
  "nodes": [
    {
      "name": "Hourly Schedule",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [
            { "mode": "everyHour" }
          ]
        }
      },
      "position": [250, 300]
    },
    {
      "name": "Fetch Funnel Metrics",
      "type": "n8n-nodes-base.googleBigQuery",
      "parameters": {
        "operation": "executeQuery",
        "query": "-- Funnel performance SQL here"
      },
      "position": [450, 300]
    },
    {
      "name": "Fetch Google Ads Performance",
      "type": "n8n-nodes-base.googleAds",
      "parameters": {
        "operation": "report",
        "resource": "campaign",
        "fields": ["CampaignId", "Cost", "Conversions", "Impressions"]
      },
      "position": [450, 450]
    },
    {
      "name": "Dynamic Pricing Engine",
      "type": "n8n-nodes-base.code",
      "parameters": {
        "jsCode": "// Complete pricing algorithm here"
      },
      "position": [650, 375]
    },
    {
      "name": "Update Campaign Budgets",
      "type": "n8n-nodes-base.googleAds",
      "parameters": {
        "operation": "update",
        "resource": "campaignBudget"
      },
      "position": [850, 375]
    },
    {
      "name": "Log Adjustments",
      "type": "n8n-nodes-base.googleBigQuery",
      "parameters": {
        "operation": "insert",
        "table": "marketing.ad_budget_adjustments"
      },
      "position": [1050, 375]
    },
    {
      "name": "Alert on Major Changes",
      "type": "n8n-nodes-base.if",
      "parameters": {
        "conditions": {
          "number": [
            {
              "value1": "={{ $json.budget_change_percent }}",
              "operation": "larger",
              "value2": 30
            }
          ]
        }
      },
      "position": [1250, 375]
    },
    {
      "name": "Send Alert",
      "type": "n8n-nodes-base.emailSend",
      "parameters": {
        "toEmail": "marketing-manager@dealership.com",
        "subject": "Major Google Ads Budget Adjustment",
        "text": "Budget changed by {{ $json.budget_change_percent }}%"
      },
      "position": [1450, 450]
    }
  ]
}
```

### 5. Safety Mechanisms

```javascript
// Prevent runaway spending
const budgetSafetyChecks = {
  // Daily change limits
  maxDailyIncrease: 0.5, // 50% max increase
  maxDailyDecrease: 0.3, // 30% max decrease
  
  // Weekly spend cap
  weeklyBudgetCap: 25000,
  
  // Require approval for large changes
  approvalThreshold: 1000, // Changes over $1000 need approval
  
  // Pause underperformers
  pauseThreshold: {
    cpa: 1000, // Pause if CPA > $1000
    conversionRate: 0.001, // Pause if CR < 0.1%
    impressions: 100 // Minimum impressions before making decisions
  }
};

function validateBudgetChange(current, proposed) {
  const change = (proposed - current) / current;
  
  // Check daily limits
  if (change > budgetSafetyChecks.maxDailyIncrease) {
    return {
      approved: false,
      reason: 'Exceeds daily increase limit',
      adjusted: current * (1 + budgetSafetyChecks.maxDailyIncrease)
    };
  }
  
  // Check if manual approval needed
  if (Math.abs(proposed - current) > budgetSafetyChecks.approvalThreshold) {
    return {
      approved: false,
      reason: 'Requires manual approval',
      queued_for_approval: true
    };
  }
  
  return { approved: true, final_budget: proposed };
}
```

### 6. Integration Points

**Google Ads API Scopes Needed:**
- `https://www.googleapis.com/auth/adwords`
- Campaign management
- Budget management
- Reporting access

**BigQuery Tables:**
- `marketing.funnel_events` - Real-time funnel data
- `marketing.ad_performance` - Historical ad performance
- `marketing.inventory_status` - Current inventory needs
- `marketing.ad_budget_adjustments` - Adjustment history

### 7. Reporting Dashboard Metrics

```javascript
const dashboardMetrics = {
  daily: {
    total_spend: 0,
    total_revenue: 0,
    roi: 0,
    conversions: 0,
    cpa: 0,
    budget_utilization: 0
  },
  adjustments: {
    count: 0,
    average_change: 0,
    biggest_increase: 0,
    biggest_decrease: 0,
    reasons: []
  },
  predictions: {
    end_of_month_spend: 0,
    projected_conversions: 0,
    recommended_monthly_budget: 0
  }
};
```

## Implementation Timeline

1. **Phase 1: Read-Only Monitoring** (Week 1)
   - Set up Google Ads API connection
   - Create performance monitoring
   - Build recommendation engine
   - No actual changes to budgets

2. **Phase 2: Small Test Campaigns** (Week 2)
   - Test on 2-3 low-spend campaigns
   - Maximum 20% adjustments
   - Daily monitoring and validation

3. **Phase 3: Gradual Rollout** (Week 3-4)
   - Expand to all search campaigns
   - Include display campaigns
   - Implement safety mechanisms

4. **Phase 4: Full Automation** (Week 5+)
   - All campaign types
   - Hourly adjustments
   - Predictive budgeting

## Success Metrics

- **Primary KPIs:**
  - Overall ROI improvement > 20%
  - CPA reduction > 15%
  - Conversion rate increase > 10%

- **Secondary KPIs:**
  - Budget utilization > 85%
  - Aged inventory reduction > 30%
  - Manual intervention reduction > 70%

## Risk Mitigation

1. **Start Conservative:** Begin with small budget adjustments (±10%)
2. **Human Oversight:** Daily review of all adjustments > $500
3. **Circuit Breakers:** Automatic pause if spend exceeds caps
4. **Rollback Plan:** One-click restore to manual budgets
5. **A/B Testing:** Keep control campaigns with static budgets