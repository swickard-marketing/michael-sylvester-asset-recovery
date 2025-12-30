# Visual Data Flow Map - Marketing Data Structure

## 🔄 COMPLETE NODE CONNECTION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MARKETING DATA STRUCTURE                              │
└─────────────────────────────────────────────────────────────────────────────┘

STAGE INDICATORS: [AWARENESS]──[CONSIDERATION]──[INTENT]──[CONVERSION]──[RETENTION]
                      (Blue)        (Green)      (Yellow)    (Purple)     (Orange)
```

---

## 📊 NODE 1: DATA SOURCES & FOCUS
```
┌──────────────────────┐
│  DATA SOURCES INPUT  │
├──────────────────────┤
│ • Google Analytics   │──┐
│ • Social Media       │  │
│ • Google Ads         │  │
│ • Google My Business │  │     🔴 RED ARROW CONNECTION
│ • Customer Data      │  │     (Primary Data Feed)
│ • CRM                │  ├────────────────────────┐
│ • Search Console     │  │                        │
│ • Demographics       │  │                        ↓
│ • Webmail           │  │              ┌──────────────────────┐
│ • Customers         │  │              │  GOOGLE ANALYTICS    │
│ • Websites          │  │              │      CODE BOX        │
│ • Analytics         │  │              │  (Implementation)    │
│ • Database          │  │              └──────────────────────┘
│ • API               │──┘
└──────────────────────┘
```

**DATA VOLUME**: 14 distinct data sources
**CONNECTION TYPE**: Red curved arrow (visible)
**DATA TRANSFERRED**: Raw unstructured data → Structured tracking code

---

## 📊 NODE 2: GOOGLE ANALYTICS IMPLEMENTATION
```
┌─────────────────────────────────────┐
│     GOOGLE ANALYTICS CODE BOX       │
├─────────────────────────────────────┤
│ GA4 Property: UA-XXXXX-Y           │
│ Tracking: pageview, events         │
│ E-commerce: enabled                │         ⬆️ UPWARD FLOW
│ Custom dimensions: configured      │         (To Segmentation)
│ Conversion goals: active           │              │
└─────────────────────────────────────┘              │
                                                     ↓
```

**DATA PROCESSED**: All 14 source types
**TRANSFORMATION**: Raw data → Tagged/tracked data
**OUTPUT**: Structured analytics events

---

## 📊 NODE 3 & 4: SEGMENTATION TABLES (MERGED)
```
┌────────────────────────────────────────────────────────────────────┐
│                    CORE SEGMENTATION TABLE                         │
├────────────┬──────────────┬──────────────┬────────────┬──────────┤
│  Segment   │ Demographics │Psychographics│Traffic/Perf│ Journey  │
├────────────┴──────────────┴──────────────┴────────────┴──────────┤
│                  ⬇️ EXPANDS INTO DETAILED KPIs ⬇️                  │
├────────────────────────────────────────────────────────────────────┤
│                  SEGMENTATION SUBTYPES / KPIs                      │
├────────────────────────────────────────────────────────────────────┤
│ Site Traffic          │ Sessions, Bounce Rate                     │
│ Geographic            │ City (245), Region (52), Country (18)     │
│ User Engagement       │ Pages/Session (4.2), Time (3:45)         │
│ Demographics          │ Age (18-65), Gender (M/F), Model         │
│ Conversions           │ Revenue ($), Duration, Goals             │
│ Device Performance    │ Desktop (45%), Mobile (40%), Tablet (15%)│
│ Social Media Activity │ Users, Links, Pins, Goals                │
└────────────────────────────────────────────────────────────────────┘
                                    │
                          MULTIPLE ARROWS →→→
                                    │
```

**DATA CATEGORIES**: 12 main categories
**METRICS TRACKED**: 50+ individual KPIs
**CONNECTION**: Direct table extension + arrows to Journey Bar

---

## 📊 NODE 5: CUSTOMER JOURNEY VISUALIZATION
```
         ┌─────────────────┐
         │ CUSTOMER JOURNEY│
         │   VERTICAL BAR  │
         ├─────────────────┤
    100% │ ████ AWARENESS  │ (Largest - Blue)
     75% │ ███ CONSIDERATION│ (Green)
     50% │ ██ INTENT       │ (Yellow)
     25% │ █ CONVERSION    │ (Purple)
     10% │ ▪ RETENTION     │ (Orange - Smallest)
         └─────────────────┘
              ↑ ↑ ↑ ↑ ↑
         [Receives data from
          segmentation tables]
```

**VISUAL DATA**: Funnel representation
**VOLUME RATIO**: 100:75:50:25:10 (approximate)
**DATA SOURCE**: Fed by all segmentation metrics

---

## 📊 NODE 6: n8n AUTOMATION HUB
```
┌──────────────────────────────────────────┐
│       CLIENT PROGRAM REPORTING (n8n)     │ ← GREEN BOX (Automation)
├──────────────────────────────────────────┤
│ • Receives from: ALL nodes              │
│ • Processing: Real-time + Scheduled     │
│ • APIs: Multiple integrations           │
│ • Output: Reports, Dashboards, Exports  │
└──────────────────────────────────────────┘
         ↓              ↓              ↓
    [Dashboard]    [Terminal]    [Exports]
```

**CONNECTIONS IN**: From all data nodes (convergence point)
**DATA VOLUME**: Aggregates 100% of workflow data
**AUTOMATION**: Runs continuously + scheduled (2:00 AM EST daily)

---

## 📊 NODE 7-9: OUTPUT INTERFACES
```
┌─────────────────┐  ┌──────────────────┐  ┌─────────────────┐
│   DASHBOARD     │  │  TERMINAL OUTPUT │  │  DATA EXPORTS   │
├─────────────────┤  ├──────────────────┤  ├─────────────────┤
│ 📈 Graphs       │  │ > Processing...  │  │ JSON ✓         │
│ 📊 Charts       │  │ > Client: 4563   │  │ CSV ✓          │
│ 🎯 KPIs         │  │ > Status: Active │  │ PDF ✓          │
└─────────────────┘  └──────────────────┘  └─────────────────┘
```

**DATA DISPLAYED**: Real-time metrics
**UPDATE FREQUENCY**: Live + Daily batch
**EXPORT FORMATS**: JSON, CSV, PDF

---

## 🔗 BOTTOM PIPELINE INTEGRATION FLOW
```
[PageSpeed]──●──[Google Ads]──●──[Facebook Ads]──●──[GA Hub]──●──[Journey Opt]──●──[Permissions]
            Blue             Blue              Blue        Blue            Blue           Final
           Circle           Circle            Circle      Circle          Circle          Node
```

**CONNECTION TYPE**: Sequential pipeline with blue node connectors
**DATA FLOW**: Left → Right
**INTEGRATION POINTS**: 6 external platforms

---

## 📈 DATA VOLUME AT EACH STAGE

### Input Volume:
- **Data Sources**: 14 unique sources × continuous feed = ~1M events/day
- **GA Implementation**: 100% of events tagged

### Processing Volume:
- **Segmentation**: 12 categories × 50+ metrics = 600+ data points
- **Journey Stages**: 5 stages tracking all users

### Output Volume:
- **n8n Processing**: 100% aggregation of all data
- **Reports Generated**: Daily automated + Real-time dashboard
- **Export Frequency**: Continuous API + Scheduled batch

---

## 🎯 KEY CONNECTION INSIGHTS

1. **PRIMARY PATH**: Data Sources → GA Code → Segmentation → Journey → n8n → Outputs
   - **Connection Evidence**: Red arrow, spatial positioning, data flow arrows

2. **PARALLEL PATH**: External platforms → GA Hub → Journey Optimization
   - **Connection Evidence**: Blue circle connectors in pipeline

3. **CONVERGENCE POINT**: n8n receives ALL data streams
   - **Connection Evidence**: Green box positioned as central aggregator

4. **DISTRIBUTION**: From n8n to multiple output formats
   - **Connection Evidence**: Multiple output nodes below n8n

---

## 🔴 CRITICAL DATA TRANSFORMATION CONNECTIONS

```
RAW DATA ──Red Arrow──> STRUCTURED DATA ──Flow──> SEGMENTED DATA ──Arrows──> JOURNEY STAGES
   (14 sources)         (GA Implementation)      (12 categories)           (5 stages)
                                                        │
                                                        ↓
                                              AUTOMATED REPORTS ←── n8n Processing
                                                        │
                                    ┌───────────────────┼───────────────────┐
                                    ↓                   ↓                   ↓
                                DASHBOARD          TERMINAL            EXPORTS
```

This visual map shows EXACTLY how each node connects, the type of connection (arrows, positioning, colors), and the data flowing through each connection point.