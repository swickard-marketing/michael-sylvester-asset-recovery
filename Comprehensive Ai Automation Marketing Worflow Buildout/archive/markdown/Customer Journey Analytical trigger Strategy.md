# Customer Journey Analytical Trigger Strategy

## Overview

This document outlines the customer journey analytical trigger strategy for Swickard's marketing automation and AI implementation initiative.

## Customer Journey Stages

### 1. Awareness Stage

**Objective:** Increase visibility and attract potential customers to the brand.

**Actions:**
- Use various traffic channels (social media, search engines, display ads) to reach a broad audience
- Set up tracking to monitor key metrics like impressions, clicks, and website visits

**Retargeting Strategy:**
- Gather initial data on users who engage with ads but don't click through
- Use this data for soft retargeting (e.g., increased frequency of display ads) to keep the brand top of mind

**Outcome:** Identify top-performing channels and messages that generate the most traffic, refining efforts to maximize reach and engagement.

### 2. Consideration Stage

**Objective:** Engage interested users and gather more detailed data about potential buyers.

**Actions:**
- Track on-site behaviors (page views, time on site, form interactions) via Google Tag Manager and BigQuery
- Segment audiences based on engagement levels and interests (e.g., specific pages visited)

**Retargeting Strategy:**
- Use retargeting conditionals based on on-site actions (e.g., viewed multiple product pages but didn't convert)
- Tailor messages to encourage further engagement, like showcasing related products or offering limited-time discounts

**Outcome:** Develop deeper insights into user behavior, refine audience segmentation for personalized messaging, and enhance user experience to increase the likelihood of conversions.

### 3. Intent Stage

**Objective:** Capture and capitalize on high-intent actions that indicate readiness to convert.

**Actions:**
- Monitor high-intent signals such as CTA clicks, lead form submissions, or abandoned cart actions
- Adjust messaging based on user behavior and offer personalized incentives (e.g., a special offer for completing a form)

**Retargeting Strategy:**
- Focus on users with strong purchase intent
- Use dynamic retargeting to show specific products or services they interacted with, adding urgency with time-sensitive offers
- Retarget users who abandoned intent actions with follow-ups via ads, emails, or SMS

**Outcome:** Personalize follow-ups, optimize conversion funnels, and increase targeting effectiveness to drive users toward making a purchase.

### 4. Conversion Stage

**Objective:** Convert leads into customers and maximize conversion quality.

**Actions:**
- Use lead scoring to categorize conversion quality (high, medium, low)
- Coordinate with sales for follow-ups, tailoring efforts based on lead quality
- Adjust campaigns to focus on high-scoring leads with the most potential for conversion

**Retargeting Strategy:**
- Reduce retargeting frequency for converted leads and focus on upsell/cross-sell opportunities
- For lower-quality leads, use nurturing campaigns to keep them engaged

**Outcome:** Improve conversion rates, gain insights into successful conversion drivers, and systematically nurture leads based on their scoring.

### 5. Retention/Advocacy Stage

**Objective:** Foster customer loyalty, encourage repeat purchases, and turn customers into brand advocates.

**Actions:**
- Gather data from service records, surveys, social media activity, and loyalty program engagement
- Segment customers into retention categories (e.g., service users, repeat purchasers, nearing lease end)

**Retargeting Strategy:**
- Use automated workflows to trigger retention campaigns for specific segments (e.g., service reminders, lease renewal offers)
- Implement advocacy programs, like referral incentives, to reward loyal customers and encourage sharing

**Outcome:** Boost customer retention, stimulate referrals, and create a continuous engagement loop that enhances customer lifetime value.

## Retargeting Conditionals

We need to establish a rule-based system (conditionals) that evaluates user interactions on a website and triggers specific marketing actions. These conditions would define how and when to trigger automated actions across different marketing channels, such as email, social media ads, or Google Ads.

### Example SQL Query:
```sql
SELECT
    user_id,
    email,
    page_time_spent,
    viewed_financing_options,
    form_submitted
FROM `project.dataset.user_behavior`
WHERE page_time_spent > 3
```

Google Cloud Functions can act as the automation engine that triggers the necessary actions across all marketing platforms, allowing for seamless cross-channel retargeting and marketing efforts.

## Journey-Optimized Marketing Performance System (JOMP)

Integrate data from BigQuery, process it with custom GPT models trained on our segmented data strategies, fitting into our analysis framework to generate Actionable Event Performance Reports. 

Utilizing custom GPT would enable us to support customized marketing opportunities and recommended actions for every dealership and each event happening on all channels. This helps us quickly identify marketing opportunities, optimize conversions, and tailor strategies to meet specific dealership goals and marketing initiatives (Campaigns).

### Core Segmentation Metrics

#### Source/Medium
- Traffic Source, Referral Source, UTM Parameters, Clicks, CTR, Impressions

#### Geolocation
- City, Region, Country, Geo-targeting Performance

#### Device & Technical Segmentation
- Device Category, Browser, Page Load Time, Site Speed

#### User Engagement (Recency, Frequency)
- Pages per Session, Time on Site, Scroll Depth, Bounce Rate, Most Clicked Banners, Average Session Duration

#### Demographics & Psychographics
- Age, Gender, Interests, Affinities, Behavioral Insights, Audience Personas

#### Ad Campaign Performance
- Ad Spend, ROAS, CTR, Ad Position, Top Performing Keywords

#### Conversion Path & Attribution
- Multi-Channel Funnels, Assisted Conversions, Attribution Models, Path Length

#### Product/Inventory Type
- Top Performing Models, Inventory Levels

#### Lead Type & Conversion Behavior
- Sales Leads, Service Leads, Form Submissions, Funnel Stages, Abandoned Conversions

#### New vs. Returning Users
- Returning Visitors, Engagement by Visit Type, Lifetime Value

#### Social Media Performance
- Engagement Rate, Post Reach, Video Views, Followers Growth, Shares

#### Email Marketing Performance
- Open Rate, Click Rate, Unsubscribe Rate, Conversion Rate (Email to Web)

## Website Data Collection Points

### Awareness Stage
- Traffic Drivers
- Display ads
- Business Listings (CarGurus, CarMax, TrueCars, Costco)
- On-Page SEO, Off-Page SEO
- Social Media (Pinterest, TikTok, Instagram, Facebook)
- Paid Social, YouTube
- Microsoft Ads, Google Ads
- Email Marketing
- Third Party sources
- SEM, SEO

### Consideration Stage
- Pages Visited
- Time on Site
- Test Drive Requests
- Get a Quote
- Finance Calculator
- Vehicle Comparison
- Inventory Filter
- Email Signup
- Retargeting Clicks
- Chatbots

### Intent Stage
- CTA Engagement
- Lead Form Submissions
- Customer Behavior
- Abandoned Intent Actions
- Personalized Actions
- Incentives & Offers
- Checking Specific VDP
- Live Chat Engagement
- Viewing Financing/Leasing
- Scheduling Appointments

### Conversion Stage
- Type of conversion (lead form, scheduled test drive, quote request)
- Timestamp of conversion
- Product or model of interest
- User communication preferences (email, phone, etc.)
- Behavior post-conversion
- Source Tracking
- Behavioral Data

### Retention/Advocacy Stage
#### Service & Maintenance
- Service records
- Maintenance history
- Service appointment bookings

#### Customer Feedback & Satisfaction
- Feedback surveys
- Satisfaction scores

#### Digital Engagement
- Website interactions
- Email engagement
- Social media activity

#### Purchase & Loyalty
- Purchase history
- Loyalty program usage

#### Communication & Response
- Phone call records
- Response times to promotions

## Customer Segmentation

### Awareness Segmentation
- On our website
- Not on our website

### Consideration Segmentation
- Analyze user behavior data and segment audiences based on different metrics (e.g., time spent on the website, pages visited, engagement with specific content)

### Intent Segmentation
- Segment users based on intent signals, such as form completions, high engagement with key content, or product interactions

### Conversion Segmentation
- **High Intent:** Viewed multiple high-value pages (e.g., pricing, financing) and submitted a lead form quickly; demonstrated urgency by scheduling a test drive or requesting a quote
- **Medium Intent:** Engaged with informational content (e.g., blog, FAQs), browsed vehicle listings, and submitted a lead form after some time; showed interest but less urgency
- **Low Intent:** Visited a few pages or clicked on general ads, then submitted a lead form without deeper engagement; likely exploring options or early in the decision-making process

### Retention/Advocacy Segmentation
- High Engagement Users
- Dormant Customers
- New Vehicle Owners
- Lease-End Customers
- Satisfied Customers (Advocacy)
- High-Spend Customers
- Dissatisfied Customers
- Referral Customers

## Lead Scoring

Assign points based on the lead's actions post-conversion:
- High points for scheduling a test drive
- Lower points for viewing more informational content

## Action Plans by Stage

### Awareness Action Plan
- Optimizing Traffic Source
- Content Adjustment
- Budget Allocation
- Audience Reach Insights
- Ad Frequency & Fatigue
- Brand Awareness Growth
- Top of Funnel Performance
- Geographical Performance
- Creative and Copy Testing
- Benchmarking
- Improvement Suggestions
- Custom Audience Segmentation

### Consideration Action Plan
- Refine audience targeting
- Optimize messaging and content
- Identify and adjust underperforming segments
- Improve website user experience
- Create personalized follow-ups
- Run A/B tests for landing pages and CTAs
- Reallocate budget to top segments
- Strengthen cross-channel consistency

### Intent Action Plan
- Refine audience segmentation (Intent signals)
- Create personalized follow-ups and offers
- Improve retargeting strategies
- Optimize messaging and timing
- Run A/B tests on CTAs and checkout flows
- Conversion path refinement
- Reallocate marketing efforts
- Content Personalization Based on Behavior
- Predictive Models

### Conversion Action Plan
- Optimizing conversion paths and user experience
- Refining audience segments based on conversion behavior
- Personalizing messaging for different levels of lead intent
- Identifying high-impact conversion triggers
- Running A/B tests on CTAs and forms
- Adjusting retargeting frequency based on lead scoring
- Enhancing cross-channel consistency to drive conversions
- Analyzing full-funnel conversion data for insights

## Technical Architecture

### Data Flow
1. **Data Collection**
   - Google Analytics
   - Google Ads
   - Google My Business
   - Microsoft Ads
   - Meta (Social media ads and engagement)
   - Search Console
   - Semrush
   - Metricool
   - Customer.io
   - DealerOn API Data
   - RunMyLease API Data
   - Widewall API Data
   - All other platforms

2. **Data Storage & Processing**
   - BigQuery Data Centralization
   - Data Ingestion
   - Data Storage & Cleaning
   - Data Blending & Integration
   - Unified Data Layer

3. **Data Analysis & Reporting**
   - Journey-Optimized Marketing Performance System (JOMP)
   - Custom GPT models for analysis
   - Marketing Master Reports
   - Individual Store Reports
   - Campaign Performance Analysis

### Website Events Tracking
- asc_click_to_call
- master_buy_click
- master_chat_click
- master_get_more_details
- master_schedule_test_drive
- master_see_payment_options
- master_see_vehicle_info
- master_text_for_price
- master_unlock_button_click
- master_value_your_trade

## Implementation Notes

- The system establishes a continuous monitoring and optimization loop across all customer journey stages
- Automated workflows ensure customers are consistently engaged
- Ongoing monitoring allows for quick adjustments
- By creating a constant loop of targeting, messaging, and analysis, the retention stage helps maintain strong customer relationships and drive long-term loyalty

## Work in Progress Items
- Marketing Data Structure refinement
- Website Opportunities analysis
- Individual Store Reports development
- Complete integration of all data sources