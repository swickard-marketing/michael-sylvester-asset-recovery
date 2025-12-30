-- PROSPECT STATUS MAPPING FOR GOOGLE ADS RETARGETING
-- Based on actual Mercedes-Benz Seattle prospect data

WITH prospect_temperature AS (
  SELECT 
    Client_Email as email,
    Client_First_Name as first_name,
    Client_Last_Name as last_name,
    Prospect_Status,
    Prospect_Status_Type as status_type,
    Prospect_Created_Date as lead_date,
    Prospect_Modified_Date as last_activity,
    Desired_Make,
    Desired_Model,
    DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, DAY) as days_since_activity,
    
    -- Determine lead temperature based on status
    CASE 
      -- HOT LEADS
      WHEN Prospect_Status = '***HOT PROSPECT' THEN 'hot'
      WHEN Prospect_Status IN ('Appointment Set', 'Appointment Shown') THEN 'hot'
      WHEN Prospect_Status IN ('Manager Review', 'Manager Help Needed') THEN 'hot'
      WHEN Prospect_Status LIKE 'Sold - %' AND Prospect_Status != 'Sold - Integration' THEN 'hot'
      WHEN Prospect_Status = 'Working' THEN 'hot'
      
      -- WARM LEADS
      WHEN Prospect_Status = '***MEDIUM PROSPECT' THEN 'warm'
      WHEN Prospect_Status = 'New' THEN 'warm'
      WHEN Prospect_Status = 'Rep Engaged - No BDC Call' THEN 'warm'
      WHEN Prospect_Status LIKE 'KBB ICO%Working' THEN 'warm'
      WHEN Prospect_Status IN ('Service', 'Promotion') THEN 'warm'
      WHEN Prospect_Status = 'Out-of-State Contacted' THEN 'warm'
      
      -- COLD LEADS
      WHEN Prospect_Status = '**COLD PROSPECT' THEN 'cold'
      WHEN Prospect_Status LIKE '%Non-Responsive%' THEN 'cold'
      WHEN Prospect_Status LIKE '%No Phone Number%' THEN 'cold'
      WHEN Prospect_Status = 'Appointment Missed/Canceled' THEN 'cold'
      WHEN Prospect_Status LIKE '%Not in Market%' THEN 'cold'
      WHEN Prospect_Status = 'Unable to Obtain Financing C/O' THEN 'cold'
      
      -- DISQUALIFIED
      WHEN Prospect_Status IN ('Sold - Integration', 'Bought Elsewhere', 'Dead', 'Duplicate') THEN 'disqualified'
      WHEN Prospect_Status = 'Opted-Out of All Comm C/O' THEN 'disqualified'
      WHEN Prospect_Status IN ('Bad Lead', 'VOI Sold to Another C/O') THEN 'disqualified'
      
      ELSE 'cold' -- Default to cold if status unknown
    END as lead_temperature,
    
    -- Determine retargeting strategy
    CASE
      WHEN Prospect_Status = 'Appointment Missed/Canceled' THEN 'reschedule_campaign'
      WHEN Prospect_Status = 'Unable to Obtain Financing C/O' THEN 'alternative_financing'
      WHEN Prospect_Status LIKE 'Service%' THEN 'service_to_sales'
      WHEN Prospect_Status LIKE 'Out-of-State%' THEN 'remote_buyer'
      WHEN Prospect_Status = 'Non-Responsive C/O' THEN 'win_back'
      WHEN Prospect_Status = 'Working' THEN 'nurture'
      WHEN Prospect_Status LIKE 'Sold - %' AND Prospect_Status != 'Sold - Integration' THEN 'close_deal'
      ELSE 'standard_retarget'
    END as campaign_strategy
    
  FROM `marketing.prospects`
  WHERE Prospect_Status_Type NOT IN ('Sold', 'Complete') -- Exclude completed sales
    AND Prospect_Status NOT IN (
      'Sold - Integration',
      'Bought Elsewhere', 
      'Dead',
      'Duplicate',
      'Opted-Out of All Comm C/O',
      'Bad Lead'
    )
)

-- Final retargeting selection with priority scoring
SELECT 
  *,
  -- Calculate priority score for budget allocation
  CASE
    WHEN lead_temperature = 'hot' THEN 100
    WHEN lead_temperature = 'warm' THEN 60
    WHEN lead_temperature = 'cold' THEN 30
    ELSE 0
  END +
  CASE
    WHEN days_since_activity <= 3 THEN 20
    WHEN days_since_activity <= 7 THEN 10
    WHEN days_since_activity <= 14 THEN 5
    ELSE 0
  END +
  CASE
    WHEN Desired_Make IN ('Mercedes-Benz', 'MERCEDES LIGHT TRUCK', 'SPRINTER') THEN 10
    ELSE 0
  END as priority_score,
  
  -- Recommended daily budget multiplier
  CASE
    WHEN lead_temperature = 'hot' AND days_since_activity <= 3 THEN 2.5
    WHEN lead_temperature = 'hot' THEN 2.0
    WHEN lead_temperature = 'warm' AND days_since_activity <= 7 THEN 1.5
    WHEN lead_temperature = 'warm' THEN 1.2
    WHEN lead_temperature = 'cold' AND campaign_strategy = 'alternative_financing' THEN 1.3
    ELSE 1.0
  END as budget_multiplier,
  
  -- Frequency cap (impressions per day)
  CASE
    WHEN lead_temperature = 'hot' THEN 7
    WHEN lead_temperature = 'warm' THEN 5
    ELSE 3
  END as frequency_cap

FROM prospect_temperature
WHERE lead_temperature != 'disqualified'
  AND days_since_activity <= 90 -- Only retarget leads active in last 90 days
ORDER BY priority_score DESC;