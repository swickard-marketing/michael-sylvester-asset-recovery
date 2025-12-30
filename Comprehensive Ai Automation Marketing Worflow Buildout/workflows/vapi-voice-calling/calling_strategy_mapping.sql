-- VAPI CALLING STRATEGY MAPPING
-- Maps prospect statuses to appropriate calling strategies and priorities

-- Create calling segments based on prospect status and behavior
WITH calling_segmentation AS (
  SELECT 
    Client_Email as email,
    Client_Cell as phone,
    Client_First_Name as first_name,
    Client_Last_Name as last_name,
    Business_Unit_Name as dealership,
    Prospect_Status,
    Prospect_Created_Date,
    Prospect_Modified_Date,
    Desired_Make,
    Desired_Model,
    Salesperson_User_Full_Name as assigned_rep,
    
    -- Calculate engagement metrics
    DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, DAY) as days_since_activity,
    DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Created_Date, DAY) as days_since_lead,
    
    -- Determine calling strategy
    CASE 
      -- IMMEDIATE CALLBACKS (Highest Priority)
      WHEN Prospect_Status = '***HOT PROSPECT' THEN 'immediate_callback'
      WHEN Prospect_Status = 'Manager Help Needed' THEN 'manager_callback'
      WHEN Prospect_Status = 'Sold - Deposit Taken' THEN 'close_deal_call'
      
      -- APPOINTMENT RECOVERY
      WHEN Prospect_Status = 'Appointment Missed/Canceled' THEN 'reschedule_call'
      WHEN Prospect_Status = 'Appointment Set' 
        AND DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, HOUR) < 24 
        THEN 'appointment_reminder_call'
      
      -- ACTIVE NURTURING
      WHEN Prospect_Status = 'Working' 
        AND DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, DAY) > 3 
        THEN 'follow_up_call'
      WHEN Prospect_Status = 'New' 
        AND DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Created_Date, HOUR) < 24 
        THEN 'welcome_call'
      WHEN Prospect_Status = 'Rep Engaged - No BDC Call' THEN 'bdc_handoff_call'
      
      -- SPECIAL SITUATIONS
      WHEN Prospect_Status = 'Service' THEN 'service_to_sales_call'
      WHEN Prospect_Status = 'Unable to Obtain Financing C/O' THEN 'financing_options_call'
      WHEN Prospect_Status LIKE 'Out-of-State%' THEN 'remote_buyer_call'
      
      -- RE-ENGAGEMENT
      WHEN Prospect_Status = 'Non-Responsive C/O' 
        AND DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, DAY) > 7 
        THEN 'winback_call'
      WHEN Prospect_Status = '**COLD PROSPECT' 
        AND DATETIME_DIFF(CURRENT_DATETIME(), Prospect_Modified_Date, DAY) > 14 
        THEN 'reactivation_call'
      
      -- DEFAULT
      ELSE 'standard_outreach_call'
    END as call_strategy,
    
    -- Set call priority (1 = highest, 5 = lowest)
    CASE
      WHEN Prospect_Status IN ('***HOT PROSPECT', 'Manager Help Needed') THEN 1
      WHEN Prospect_Status IN ('Appointment Missed/Canceled', 'Sold - Deposit Taken') THEN 1
      WHEN Prospect_Status IN ('Working', 'Appointment Set') THEN 2
      WHEN Prospect_Status IN ('New', 'Service', 'Unable to Obtain Financing C/O') THEN 3
      WHEN Prospect_Status IN ('***MEDIUM PROSPECT', 'Rep Engaged - No BDC Call') THEN 3
      WHEN Prospect_Status IN ('Non-Responsive C/O', '**COLD PROSPECT') THEN 4
      ELSE 5
    END as call_priority,
    
    -- Determine best time to call
    CASE
      WHEN Prospect_Status = '***HOT PROSPECT' THEN 'immediate'
      WHEN Prospect_Status = 'Appointment Missed/Canceled' THEN 'morning'
      WHEN Prospect_Status = 'Service' THEN 'afternoon'
      WHEN Prospect_Status LIKE 'Out-of-State%' THEN 'flexible'
      ELSE 'business_hours'
    END as optimal_call_time,
    
    -- Set maximum call attempts
    CASE
      WHEN Prospect_Status IN ('***HOT PROSPECT', 'Manager Help Needed') THEN 5
      WHEN Prospect_Status = 'Working' THEN 4
      WHEN Prospect_Status IN ('New', 'Service') THEN 3
      WHEN Prospect_Status IN ('Non-Responsive C/O', '**COLD PROSPECT') THEN 2
      ELSE 3
    END as max_attempts
    
  FROM `marketing.prospects`
  WHERE Client_Cell IS NOT NULL
    AND Client_Cell != ''
    AND Dealer_Contact_Consent_for_Phone = 'Y'
    AND Prospect_Status NOT IN (
      'Sold - Integration',
      'Bought Elsewhere',
      'Dead',
      'Duplicate',
      'Bad Lead',
      'Opted-Out of All Comm C/O'
    )
)

-- Apply calling frequency rules
, calling_schedule AS (
  SELECT 
    cs.*,
    -- Determine calling frequency (hours between attempts)
    CASE 
      WHEN call_priority = 1 THEN 24  -- Daily for hot leads
      WHEN call_priority = 2 THEN 48  -- Every 2 days for warm
      WHEN call_priority = 3 THEN 72  -- Every 3 days for medium
      ELSE 168  -- Weekly for cold
    END as hours_between_calls,
    
    -- Set voicemail strategy
    CASE
      WHEN call_strategy = 'immediate_callback' THEN 'leave_urgent_vm'
      WHEN call_strategy = 'reschedule_call' THEN 'leave_reschedule_vm'
      WHEN call_strategy = 'financing_options_call' THEN 'leave_solution_vm'
      WHEN call_priority <= 2 THEN 'leave_personalized_vm'
      ELSE 'leave_standard_vm'
    END as voicemail_strategy,
    
    -- Determine assistant personality
    CASE
      WHEN call_strategy LIKE '%financing%' THEN 'financial_advisor'
      WHEN call_strategy LIKE '%service%' THEN 'service_specialist'
      WHEN call_strategy LIKE '%manager%' THEN 'senior_consultant'
      WHEN call_priority = 1 THEN 'sales_closer'
      WHEN call_priority <= 3 THEN 'sales_consultant'
      ELSE 'customer_service'
    END as assistant_personality
    
  FROM calling_segmentation cs
)

-- Final output with call script templates
SELECT 
  *,
  -- Generate dynamic first message based on strategy
  CASE call_strategy
    WHEN 'immediate_callback' THEN 
      CONCAT('Hi ', first_name, ', this is a callback from ', dealership, 
             ' regarding your interest in the ', Desired_Make, ' ', Desired_Model, 
             '. Is now a good time to talk?')
    
    WHEN 'reschedule_call' THEN
      CONCAT('Hi ', first_name, ', I\'m calling from ', dealership, 
             '. I noticed you had an appointment that didn\'t work out. ',
             'I\'d love to help reschedule at a better time for you.')
    
    WHEN 'welcome_call' THEN
      CONCAT('Hi ', first_name, ', welcome to ', dealership, '! ',
             'I saw you were looking at our ', Desired_Make, ' inventory. ',
             'How can I help you today?')
    
    WHEN 'service_to_sales_call' THEN
      CONCAT('Hi ', first_name, ', as a valued service customer at ', dealership,
             ', I wanted to share an exclusive upgrade opportunity.')
    
    WHEN 'financing_options_call' THEN
      CONCAT('Hi ', first_name, ', good news from ', dealership, '! ',
             'We have new financing options that weren\'t available before.')
    
    WHEN 'winback_call' THEN
      CONCAT('Hi ', first_name, ', I\'m reaching out from ', dealership, '. ',
             'We haven\'t heard from you in a while and wanted to see if there\'s ',
             'anything we can help with.')
    
    ELSE
      CONCAT('Hi ', first_name, ', I\'m calling from ', dealership, '. ',
             'How can I help you with your vehicle search today?')
  END as first_message_template,
  
  -- Expected call outcomes
  CASE 
    WHEN call_priority = 1 THEN 'appointment_or_sale'
    WHEN call_priority = 2 THEN 'appointment_or_engagement'
    WHEN call_priority = 3 THEN 'information_gathering'
    ELSE 'reactivation'
  END as expected_outcome

FROM calling_schedule
WHERE days_since_activity <= 90  -- Only call prospects active in last 90 days
ORDER BY call_priority ASC, days_since_activity ASC;