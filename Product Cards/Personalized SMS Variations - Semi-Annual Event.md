# Personalized SMS Variations - Semi-Annual Event

## Luxury Pre-Owned Variations

### Variation 1: Name + Current Vehicle Personalization
🌠 Semi-Annual Luxury Showcase 🌠

Hi {% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}there{% endif %}, ready to upgrade from your {% if customer.Vehicle-Year and customer.Vehicle-Make %}{{ customer.Vehicle-Year }} {{ customer.Vehicle-Make }}{% else %}current vehicle{% endif %}? Experience tariff-free access to certified pre-owned luxury vehicles during our exclusive event.

CTA: Reserve Your Private Viewing → Connect Now: [Link/Phone]

---

### Variation 2: Trade-In + Desired Make Personalization
🌠 Semi-Annual Luxury Showcase 🌠

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, we have exceptional {% if customer.Desired-Make %}{{ customer.Desired-Make }}{% else %}luxury{% endif %} pre-owned vehicles arriving for our exclusive event. {% if customer.Trade-Year and customer.Trade-Make %}Your {{ customer.Trade-Year }} {{ customer.Trade-Make }} could be your entry to tariff-free luxury.{% else %}Your trade-in could be your entry to tariff-free luxury.{% endif %}

CTA: Reserve Your Private Viewing → Connect Now: [Link/Phone]

---

### Variation 3: Service History + Advisor Personalization  
🌠 Semi-Annual Luxury Showcase 🌠

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, {% if customer.Advisor-Name %}{{ customer.Advisor-Name }}{% else %}your advisor{% endif %} wanted you to know about our Semi-Annual Luxury Event. Meticulously curated pre-owned luxury vehicles, all tariff-free.

CTA: Reserve Your Private Viewing → Connect Now: [Link/Phone]

---

### Variation 4: Location + Vehicle Interest Personalization
🌠 Semi-Annual Luxury Showcase 🌠

{% if customer.Client-City %}Exclusive to {{ customer.Client-City }} customers:{% else %}Exclusive invitation:{% endif %} Experience tariff-free certified pre-owned luxury during our Semi-Annual Event. {% if customer.Desired-Model %}We have the {{ customer.Desired-Model }} you've been considering.{% else %}We have luxury vehicles you'll love.{% endif %}

CTA: Reserve Your Private Viewing → Connect Now: [Link/Phone]

---

### Variation 5: Full Name + Business Unit Personalization
🌠 Semi-Annual Luxury Showcase 🌠

{% if customer.Client-Full-Name %}{{ customer.Client-Full-Name }}{% else %}Hi there{% endif %}, {% if customer.Business-Unit-Name %}{{ customer.Business-Unit-Name }}{% else %}we{% endif %} invites you to our exclusive Semi-Annual Luxury Event. Tariff-free access to meticulously curated pre-owned luxury vehicles.

CTA: Reserve Your Private Viewing → Connect Now: [Link/Phone]

---

## Lifestyle Pre-Owned Variations

### Variation 1: Name + Vehicle Type Personalization
🌍 Your Life, Your Ride, Tariff-Free 🌍

Hi {% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}there{% endif %}! {% if customer.Desired-Stock-Type %}Looking for {{ customer.Desired-Stock-Type | downcase }}?{% else %}Ready for something new?{% endif %} Explore versatile pre-owned SUVs, trucks, and hybrids—all tariff-free during our Semi-Annual Event.

CTA: Find Your Perfect Match → [Link/Phone]

---

### Variation 2: Trade Vehicle + Adventure Focus
🌍 Your Life, Your Ride, Tariff-Free 🌍

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, time to upgrade from your {% if customer.Trade-Year and customer.Trade-Make %}{{ customer.Trade-Year }} {{ customer.Trade-Make }}{% else %}current ride{% endif %}? Discover adventure-ready pre-owned vehicles designed for your active lifestyle. Tariff-free during our Semi-Annual Event.

CTA: Find Your Perfect Match → [Link/Phone]

---

### Variation 3: Service Date + Family Focus
🌍 Your Life, Your Ride, Tariff-Free 🌍

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, {% if customer.CS-Client-Last-RO-Date %}since your last visit on {{ customer.CS-Client-Last-RO-Date | date: '%B %Y' }},{% else %}recently,{% endif %} we've added family-friendly pre-owned SUVs and hybrids. All tariff-free this Semi-Annual Event.

CTA: Find Your Perfect Match → [Link/Phone]

---

### Variation 4: Mileage + Efficiency Focus
🌍 Your Life, Your Ride, Tariff-Free 🌍

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, {% if customer.Vehicle-Last-RO-Mileage %}with {{ customer.Vehicle-Last-RO-Mileage | number_with_delimiter }} miles on your current ride,{% else %}looking for better efficiency?{% endif %} consider our efficient pre-owned hybrids and trucks. Tariff-free options during our Semi-Annual Event.

CTA: Find Your Perfect Match → [Link/Phone]

---

### Variation 5: Salesperson + Desired Features
🌍 Your Life, Your Ride, Tariff-Free 🌍

{% if customer.Client-First-Name %}{{ customer.Client-First-Name }}{% else %}Hi there{% endif %}, {% if customer.Salesperson/User-Full-Name %}{{ customer.Salesperson/User-Full-Name }}{% else %}your sales advisor{% endif %} found pre-owned {% if customer.Desired-Style %}{{ customer.Desired-Style | downcase }}{% else %}vehicles{% endif %} perfect for your lifestyle. Tariff-free during our Semi-Annual Event.

CTA: Find Your Perfect Match → [Link/Phone]

---

## Personalization Notes

### Key Attributes Used:
- **Customer Identity**: `Client-First-Name`, `Client-Full-Name`
- **Current Vehicle**: `Vehicle-Year`, `Vehicle-Make`, `Vehicle-Last-RO-Mileage`
- **Trade Vehicle**: `Trade-Year`, `Trade-Make`
- **Preferences**: `Desired-Make`, `Desired-Model`, `Desired-Stock-Type`, `Desired-Style`
- **Relationship**: `Advisor-Name`, `Salesperson/User-Full-Name`, `Business-Unit-Name`
- **Location**: `Client-City`
- **Service History**: `CS-Client-Last-RO-Date`

### Liquid Template Features Used:
- **Conditional Logic**: `{% if %}{% else %}{% endif %}`
- **Date Formatting**: `| date: '%B %Y'`
- **Text Filters**: `| downcase`, `| number_with_delimiter`
- **Fallback Values**: Default text when attributes are empty

### Implementation Tips:
1. Test all conditional logic with sample data
2. Ensure fallback text maintains message quality
3. Consider character limits for SMS (160 characters recommended)
4. Validate phone number and link formatting
5. A/B test different personalization approaches 
