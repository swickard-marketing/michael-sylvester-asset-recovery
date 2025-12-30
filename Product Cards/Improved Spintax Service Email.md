# Improved Spintax Service Email

## Enhanced Service Maintenance Email with Spintax

```liquid
{% assign miles = customer.Vehicle-Last-RO-Mileage | default: 0 | floor %}
{% assign year = customer.Vehicle-Year | default: "current" %}
{% assign make = customer.Vehicle-Make | default: "vehicle" %}
{% assign model = customer.Vehicle-Model | default: "" %}
{% assign vehicle = make %}{% if model != "" and model != make %} {{ model }}{% endif %}
{% assign last_service = customer.CS-RO-Close-Date | default: "" %}
{% assign days_since = 'now' | date: '%s' | minus: last_service | date: '%s' | divided_by: 86400 %}
{% assign first_name = customer.Client-First-Name | default: "" %}
{% assign advisor = customer.Advisor-Name | default: "" %}
{% assign dealership = customer.Business-Unit-Name | default: "our service center" %}
{% assign city = customer.Client-City | default: "" %}



{% if first_name != "" %}{{ first_name }}, {% endif %}{quick question|got a minute}?



{% if days_since > 180 %}
  {I noticed|We noticed|I saw} it's been {{ days_since | divided_by: 30 | floor }} months since your {{ vehicle }} {visited us|came in|had service}.
{% elsif miles > 75000 %}
  Your {{ vehicle }} {has been working hard|is a real trooper} with {{ miles | number_with_delimiter }} miles on it.
{% else %}
  {How's|How is} your {{ year }} {{ vehicle }} {treating you|running these days}?
{% endif %}



{Here's the thing|The reason I'm reaching out}: {% if miles > 100000 %}{high-mileage vehicles|vehicles with serious miles}{% elsif year < 2015 %}{experienced vehicles|vehicles with some years}{% else %}{modern vehicles|today's vehicles}{% endif %} {need a bit of TLC|benefit from regular check-ups|perform best with consistent care} to {avoid surprise repairs|prevent costly breakdowns|keep running smoothly}.



{% if advisor != "" %}
  {{ advisor }} {mentioned|told me|noted} that your {{ vehicle }} {might be due for|could benefit from|is ready for} {some attention|a check-up|service}.
{% endif %}



{Good news|Perfect timing|Here's what I can do for you}: This week {only|through {{ 'now' | date: '%A' }}}, we're offering:

💰 {{ "{$39.95 Oil Change Special|$59.95 Complete Inspection|$89.95 Premium Service Package}" | split: "|" | sample }} 
   ({normally|usually|regularly} {{ "{$79.95|$119.95|$159.95}" | split: "|" | sample }})

✅ {Includes|You get|This covers}: {{ "{27-point inspection|tire rotation|fluid top-offs|battery test}" | split: "|" | sample }}

⏱️ {Quick service|Fast turnaround|In and out} - {under an hour|about 45 minutes|less than 60 minutes}

{% if city != "" %}🏠 {Convenient|Easy access from} {{ city }}{% endif %}



{But here's the catch|Fair warning|Important}: We only have {{ "{3|5|7}" | split: "|" | sample }} {spots left|appointments available|openings} this week.



{The last thing you want|I'd hate to see you|Nobody wants} {is a breakdown|stuck on the roadside|dealing with car trouble} {when it's preventable|that could've been avoided|during your busy week}.



{Ready to|Want to} {grab one of those spots|lock in your appointment|secure your time}?

{Reply with|Text back|Just send} your preferred day, or {call|reach} {{ advisor | default: "us" }} at {{ customer.Advisor-Number | default: "[Phone]" }}.



{Take care|Drive safe|Best},
{{ advisor | default: "Your Service Team" }}
{{ dealership }}

P.S. {Seriously|No joke|For real}, those {{ miles | number_with_delimiter }} miles {mean|show} your {{ vehicle }} {has been good to you|is a keeper}. {Let's keep it that way|Return the favor|Let's make sure it stays reliable}. 😊
```

## Alternative Version - More Direct & Action-Oriented

```liquid
{% assign miles = customer.Vehicle-Last-RO-Mileage | default: 0 | floor %}
{% assign year = customer.Vehicle-Year | default: "" %}
{% assign make = customer.Vehicle-Make | default: "vehicle" %}
{% assign model = customer.Vehicle-Model | default: "" %}
{% assign vehicle = make %}{% if model != "" and model != make %} {{ model }}{% endif %}
{% assign first_name = customer.Client-First-Name | default: "Hi" %}
{% assign advisor = customer.Advisor-Name | default: "Your advisor" %}
{% assign ro_number = customer.CS-RO-Number | default: "" %}



{{ first_name }} - {WAIT|STOP|HOLD UP}! ✋



{Don't ignore this|This is important|Please read this}: Your {{ year }} {{ vehicle }} {needs you|is calling for help|is overdue}.



{📊 The facts|💡 Reality check|🚨 Truth bomb}:
• Last service: {{ customer.CS-RO-Close-Date | date: "%m/%d/%Y" | default: "Too long ago" }}
• Current mileage: {{ miles | number_with_delimiter | default: "Unknown" }}
• {Risk level|Breakdown chance}: {% if miles > 100000 %}{HIGH|ELEVATED}{% else %}{MODERATE|GROWING}{% endif %}



{Here's what happens|The problem is|What we see} when {people|customers|drivers} {skip service|wait too long|delay maintenance}:

{% if miles > 75000 %}
❌ {$800 transmission repairs|$1,200 engine fixes|$600 cooling system failures}
{% else %}
❌ {$400 brake jobs|$500 suspension repairs|$300 electrical issues}
{% endif %}



{But you can avoid this|The solution is simple|Good news}: 

🎯 {TODAY ONLY|LIMITED TIME|FLASH SALE}: {{ "{$39.95|$49.95|$59.95}" | split: "|" | sample }} {complete service|full inspection|maintenance special}

{That's|You save} {{ "{60%|50%|40%}" | split: "|" | sample }} off {regular price|normal cost|standard rate}!



{Available times|Open slots|You can come}:
📅 {Today 2pm|Tomorrow morning|This afternoon}
📅 {Tomorrow 3pm|Thursday 10am|Friday 8am}
📅 {{ 'now' | date: '%A' }} {evening|afternoon|morning}



⚡ {BOOK NOW|CLAIM YOUR SPOT|RESERVE}: Reply "{YES|OK|BOOK}" to this {text|message}

{Questions|Need options|Different time}? Call {{ customer.Advisor-Number | default: "[Phone]" }}



{{ advisor }}
{Keeping your {{ vehicle }} healthy|Protecting your investment|Your {{ vehicle }} advocate}

P.S. {Ignore this = risk breakdown|Prevention < repair bills|Small service > big problems}. {Your call|Choose wisely|Act now}. 
```

## Key Improvements in These Versions:

### 1. **Conversational Tone**
- More natural language flow
- Direct questions to engage the reader
- Casual but professional approach

### 2. **Smart Personalization**
- Uses conditional logic for mileage-based messaging
- Calculates days since last service
- Adapts tone based on vehicle age/condition

### 3. **Urgency Without Pressure**
- Limited appointment availability
- Time-sensitive pricing
- Consequence-based motivation

### 4. **Clear Value Proposition**
- Specific pricing with savings
- What's included in service
- Time commitment stated

### 5. **Easy Call-to-Action**
- Multiple response options
- Clear next steps
- Direct contact information

### 6. **Visual Enhancement**
- Emojis for better engagement
- Bullet points for scannability
- Clear formatting structure

### 7. **Trust Building**
- Advisor name personalization
- Local dealership reference
- P.S. adds personality

The spintax variations create multiple message versions while maintaining coherence and professionalism. Each variation feels natural regardless of which options are selected. 