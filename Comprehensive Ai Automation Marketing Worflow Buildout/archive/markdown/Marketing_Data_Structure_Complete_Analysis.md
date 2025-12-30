# Marketing Data Structure - Complete Data Flow Analysis

## Overview
This document provides a comprehensive analysis of the Marketing Data Structure, mapping the entire customer journey data flow with all node titles, data fields, and lifecycle points visible in the workflow.

---

## 1. Data Sources & Focus (Left Panel Table)

### Node Title: "Data Sources & Focus"
**Position**: Left side of workflow
**Node Type**: Data Input Registry

### Complete Data List:
1. **Google Analytics** - Website tracking and behavior analytics
2. **Social Media** - Social platform engagement data
3. **Google Ads** - Paid search advertising metrics
4. **Google My Business** - Local business listing performance
5. **Customer Data** - Direct customer information
6. **CRM** - Customer relationship management system
7. **Search Console** - Organic search performance
8. **Demographics** - User demographic information
9. **Webmail** - Email communication data
10. **Customers** - Customer database
11. **Websites** - Website interaction data
12. **Analytics** - General analytics platforms
13. **Database** - Core database systems
14. **API** - Application programming interfaces

**Data Flow Direction**: Feeds into → Google Analytics Code configuration

---

## 2. Google Analytics Code (Yellow/Orange Box)

### Node Title: "Google Analytics Code"
**Position**: Center-left, connected from Data Sources
**Node Type**: Implementation Code Container

### Complete Code Structure Visible:
```javascript
<!-- Google Analytics -->
<script>
(function(i,s,o,g,r,a,m){
i['GoogleAnalyticsObject']=r;
i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)
},i[r].l=1*new Date();
a=s.createElement(o),
m=s.getElementsByTagName(o)[0];
a.async=1;a.src=g;
m.parentNode.insertBefore(a,m)
})(window,document,'script',
'https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-XXXXX-Y', 'auto');
ga('send', 'pageview');
</script>
<!-- End Google Analytics -->
```

### Additional Implementation Elements:
- Event tracking parameters
- Custom dimension setup
- E-commerce tracking
- Conversion goals configuration

**Data Flow Direction**: Connects to → Core Segmentation table

---

## 3. Core Segmentation Table (Top Center)

### Node Title: "Core Segmentation" / "Segmentation Subtypes / KPIs"
**Position**: Center top of workflow
**Node Type**: Data Categorization Matrix

### Table Headers (Left to Right):
1. **Segment Name** - Identifier for each segment
2. **Demographics** - User demographic data
3. **Psychographics** - Behavioral and interest data
4. **Traffic Source/Behavior/Performance** - Source and behavior metrics
5. **Customer Journey** - Journey stage assignment

### Complete Data Categories Within Table:
- **Row Categories**:
  - Geographic
  - General & Technical Requirements
  - Site, Region, Country, New Targeting Performance

**Data Flow Direction**: Feeds into → Customer Journey vertical bar

---

## 4. Segmentation Subtypes/KPIs (Detailed Center Table)

### Node Title: "Segmentation Subtypes / KPIs"
**Position**: Center of workflow
**Node Type**: Metrics Classification Grid

### Complete Category List with All Subfields:

#### Site Traffic
- Sessions
- Bounce Rate

#### Geographic
- City
- Region
- Country
- New Sessions/Performance

#### General & Technical Requirements
- Service Company
- Strategic Plan
- Lead Gen
- Site Specs

#### User Engagement Reports
- Pages per Session / Time on Site
- Goal Export
- Bounce Rate
- Direct/Referral
- Returns

#### Channels & Attribution
- Multi-Channel Funnel
- Standard Conversions
- Attribution Models
- Goal Location

#### Demographics & Attribution
- Age
- Gender
- Model
- CPA
- Top Performing Keywords
- Revenue

#### Conversion Rate & Attribution
- Multi-Channel Funnel
- Standard Conversions
- Attribution Models
- Goal Location

#### Product/Conversions / E-comm
- Revenue
- Average Session Duration

#### User Type & Conversion Behavior
- User Loyalty
- Service Usage From Submissions
- Content/Pages
- Abandonment

#### Hours on Site/Activity
- Hours on Site/Activity
- Exit Rate
- Sessions Data

#### Device/Mobile Performance
- Device Stats
- First Phone
- Mobile Return
- Behavior
- Mobile

#### Social Media Activity
- Users
- Sites
- Links
- Pins
- Organization Rate
- Conversion Path
- Source
- Goals

**Data Flow Direction**: Multiple outputs to → Journey stages and reporting

---

## 5. Customer Journey (Vertical Bar Chart)

### Node Title: "Customer Journey"
**Position**: Right side vertical bar
**Node Type**: Journey Stage Visualization

### Stage Colors and Heights (Top to Bottom):
1. **Blue Section** - Awareness (Largest segment)
2. **Green Section** - Consideration 
3. **Yellow Section** - Intent
4. **Purple Section** - Conversion
5. **Orange Section** - Retention/Advocacy (Smallest segment)

**Visual Representation**: Funnel visualization showing volume at each stage
**Data Flow Direction**: Receives data from → Segmentation tables

---

## 6. Client Program Reporting (n8n)

### Node Title: "Client Program Reporting (n8n)"
**Position**: Top right, green box
**Node Type**: Automation Integration

### Visible Description:
"This node has automation built through the different n8n segments that establish all detailed reports. The user can go to the platform and get their client reports. The reporting is collected across different segments. n8n is running on cloudron services. APIs and audit reports also link services of completed implementations to completed services/development, the reporting also allows reporting and tracking for each client while marketing services"

**Data Flow Direction**: Aggregates from → All data sources and outputs reports

---

## 7. Reporting Dashboard Interface

### Node Title: "Reporting"
**Position**: Right side, below n8n node
**Node Type**: Analytics Dashboard Mockup

### Visible Interface Elements:
- Graph visualizations
- Metric displays
- Performance indicators
- Trend lines
- Data tables

**Data Flow Direction**: Displays aggregated data from → Analytics processing

---

## 8. Marketing Data Reports (Black Terminal)

### Node Title: "Marketing Data Reports"
**Position**: Bottom right
**Node Type**: Code/Script Output Window

### Visible Script Elements:
```
Marketing Dashboard Processing for Performance Analytics (13424)

Current script compiles all sources, generates performance reports.
Generating reports for client id: 4563, date range: last 30 days
Processing Google Analytics data...
Processing Social Media metrics...
Aggregating conversion funnel data...
Report compilation complete. Sending to client dashboard.
Output format: JSON, CSV, PDF
Automation status: Active
Next scheduled run: Daily @ 2:00 AM EST
```

**Data Flow Direction**: Processes data from → All sources, outputs to → Client dashboards

---

## 9. Attribution Model Configuration (Pink Box, Left)

### Node Title: Attribution Model Notes
**Position**: Bottom left, pink sticky note
**Node Type**: Configuration Notes

### Complete Text Content:
"We need to implement an attribution model to track:
- First touch
- Last touch  
- Multi-channel funnels
- Position-based
- Time decay
- Data-driven attribution
- Custom model based on business needs"

**Data Flow Direction**: Configuration for → Analytics implementation

---

## 10. Pipeline/Workflow Connections (Bottom)

### Node Title: Pipeline/Funnel Insights
**Position**: Bottom of image
**Node Type**: Integration Flow Diagram

### Complete Flow Sequence (Left to Right):

1. **PageSpeed Insights**
   - Connection type: API integration
   - Data: Site performance metrics

2. **Google Ads** 
   - Connection type: Direct API
   - Data: Paid advertising data
   
3. **Facebook Ads**
   - Connection type: Marketing API
   - Data: Social advertising metrics

4. **Google Analytics** (Central Hub)
   - Connection type: Core integration
   - Data: All analytics processing

5. **Customer Journey Optimization**
   - Connection type: Data flow
   - Data: Journey mapping and optimization

6. **Separate Project (Viewer Permissions)**
   - Connection type: Access control
   - Data: Restricted view access

**Connection Indicators**:
- Blue circles: Active data flow points
- Lines: Data transmission paths
- Arrows: Direction of data flow

---

## 11. Main Navigation Elements (Top Row)

### Journey Stage Indicators:
**Position**: Colored bars across top
**Node Type**: Stage Navigation

1. **Awareness** (Blue bar)
2. **Consideration** (Green bar)  
3. **Intent** (Yellow bar)
4. **Conversion** (Purple bar)
5. **Retention/Advocacy** (Orange bar)

---

## Node-to-Node Connection Map

### Visual Connection Analysis

#### Connection 1: Data Sources → Google Analytics Code
- **Connection Type**: Red curved arrow/line
- **Direction**: From right side of Data Sources table to left side of GA Code box
- **Visual Indicator**: Solid red connection line
- **Data Transfer**: All 14 data sources feed into analytics implementation

#### Connection 2: Google Analytics Code → Core Segmentation
- **Connection Type**: Implied flow (positioned adjacency)
- **Direction**: Upward from GA Code to Segmentation table
- **Visual Indicator**: Spatial relationship, no direct line visible
- **Data Transfer**: Processed analytics data populates segmentation

#### Connection 3: Core Segmentation → Segmentation Subtypes/KPIs
- **Connection Type**: Direct table extension
- **Direction**: Core table expands into detailed KPI grid
- **Visual Indicator**: Tables are visually connected/merged
- **Data Transfer**: High-level segments break down into specific metrics

#### Connection 4: Segmentation Tables → Customer Journey Bar
- **Connection Type**: Data flow arrows
- **Direction**: From right edge of tables to left side of journey bar
- **Visual Indicator**: Multiple small arrows pointing to journey stages
- **Data Transfer**: Segmented data populates journey stage volumes

#### Connection 5: All Nodes → Client Program Reporting (n8n)
- **Connection Type**: Multiple input streams
- **Direction**: Converging from multiple sources to n8n box
- **Visual Indicator**: Green box positioned to receive all data
- **Data Transfer**: Aggregates all data for automated reporting

#### Connection 6: n8n → Reporting Dashboard
- **Connection Type**: Output flow
- **Direction**: Downward from n8n to dashboard interface
- **Visual Indicator**: Positioned below for output display
- **Data Transfer**: Processed reports to visual dashboard

#### Connection 7: Pipeline Connections (Bottom Flow)
- **Connection Type**: Linear pipeline with blue connector nodes
- **Direction**: Left to right sequential flow
- **Visual Path**: 
  1. PageSpeed Insights (blue circle connector) →
  2. Google Ads (blue circle connector) →
  3. Facebook Ads (blue circle connector) →
  4. Google Analytics Hub (central blue circle) →
  5. Customer Journey Optimization (blue circle) →
  6. Separate Project/Permissions (final node)
- **Visual Indicators**: Blue circles at each connection point
- **Data Transfer**: External platform data integration

#### Connection 8: Attribution Model → Analytics Implementation
- **Connection Type**: Configuration relationship
- **Direction**: Pink note provides config for analytics setup
- **Visual Indicator**: Positioned near GA implementation area
- **Data Transfer**: Attribution rules applied to tracking

#### Connection 9: Marketing Data Reports Terminal → Export Systems
- **Connection Type**: Script execution output
- **Direction**: From terminal to external systems
- **Visual Indicator**: Black terminal window showing active processing
- **Data Transfer**: Automated data exports

## Complete Data Flow Lifecycle Summary

### Input Phase:
1. **Data Sources & Focus** collects from 14 different sources
2. Sources feed into **Google Analytics Code** implementation

### Processing Phase:
3. Analytics code sends data to **Core Segmentation** table
4. Segmentation creates **Subtypes/KPIs** across 12 categories
5. Categories populate the **Customer Journey** visualization

### Integration Phase:
6. **Pipeline connections** integrate external platforms
7. **Attribution Model** tracks multi-touch conversions
8. **n8n automation** processes all data streams

### Output Phase:
9. **Client Program Reporting** generates automated reports
10. **Reporting Dashboard** displays real-time metrics
11. **Marketing Data Reports** terminal executes scheduled exports

### Access Control:
12. **Separate Project (Viewer Permissions)** manages data access

---

## Primary Data Flow Path

### The Main Journey (Following Visual Connections):

1. **Starting Point**: Data Sources & Focus (14 sources)
   ↓ (Red arrow connection)
2. **Processing**: Google Analytics Code Implementation
   ↓ (Upward flow to tables)
3. **Categorization**: Core Segmentation Table
   → (Direct extension)
4. **Metrics**: Segmentation Subtypes/KPIs Grid
   → (Multiple arrows)
5. **Visualization**: Customer Journey Bar (5 stages)
   ↓ (Convergence)
6. **Automation**: Client Program Reporting (n8n)
   ↓ (Output flow)
7. **Display**: Reporting Dashboard & Terminal Exports

### Parallel Integration Path (Bottom Pipeline):
- PageSpeed → Google Ads → Facebook Ads → GA Hub → Journey Optimization → Permissions

### Connection Color Coding:
- **Red Lines**: Primary data input connections
- **Blue Circles**: Integration points
- **Green Box**: Automation hub (n8n)
- **Black Lines**: Standard data flow
- **Arrows**: Direction of data movement

## Key Data Transformation Points

1. **Raw Data → Structured Data**: Data Sources to Analytics Code
2. **Structured Data → Segmented Data**: Analytics to Segmentation Tables
3. **Segmented Data → Journey Stages**: Tables to Customer Journey Bar
4. **Journey Data → Reports**: All sources to n8n Reporting
5. **Reports → Client Access**: n8n to Dashboard/Exports

---

## Critical Integration APIs Visible

- Google Analytics API
- Google Ads API
- Facebook Marketing API
- PageSpeed Insights API
- CRM API connections
- Custom database APIs
- n8n webhook integrations

---

## Automation Triggers

Based on visible elements:
- Daily report generation (2:00 AM EST)
- Real-time dashboard updates
- Event-based tracking triggers
- Conversion goal completions
- Attribution model calculations
- Segmentation updates

This complete analysis maps every visible node, data field, and connection in the Marketing Data Structure workflow, providing a comprehensive reference for the entire customer journey data flow.