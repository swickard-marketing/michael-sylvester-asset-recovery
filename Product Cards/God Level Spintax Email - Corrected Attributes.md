# God Level Spintax Email - Corrected Attributes

## Spintax Email with Proper Customer.io Attributes

```liquid
{% assign miles = customer.Vehicle-Last-RO-Mileage | default: 0 | floor %}
{% assign year = customer.Vehicle-Year | default: "recent" %}
{% assign make = customer.Vehicle-Make | default: "vehicle" %}
{% assign model = customer.Vehicle-Model | default: "vehicle" %}
{% assign last_service = customer.CS-RO-Close-Date | date: "%B %d, %Y" %}
{% assign first_name = customer.Client-First-Name | default: "Valued Customer" %}



Hey {{ first_name }},



Your {{ year }} {{ make }} {{ model }} {has been|is} {a trusted companion|serving you well}{% if miles > 0 %} for {{ miles }} miles{% endif %}.



{% if miles > 200000 %}
  {With such impressive mileage|After so many miles on the road}, it's crucial to give your {{ model }} some extra attention.
{% elsif miles > 100000 %}
  {With over 100,000 miles|As your vehicle enters its second century of miles}, regular maintenance becomes even more important.
{% elsif miles > 50000 %}
  {As your {{ model }} passes the 50,000-mile mark|With significant mileage under its belt}, it's time for some key maintenance checks.
{% elsif miles > 0 %}
  {Even though your {{ model }} is still relatively young|While your {{ model }} is still breaking in}, regular maintenance is key to keeping it in top shape.
{% else %}
  {To keep your {{ model }} running smoothly|To maintain your {{ model }}'s performance}, it's time for some routine care.
{% endif %}



{% if year == "recent" or year >= 2020 %}
  {As a newer model|With modern technology under the hood}, your {{ model }} benefits from {proactive maintenance|preventive care}.
{% elsif year >= 2010 %}
  {As a modern vehicle|With its advanced systems}, your {{ model }} requires {regular attention|consistent care}.
{% else %}
  {As a seasoned traveler|With its wealth of experience}, your {{ model }} deserves {special attention|expert care}.
{% endif %}



That's why we're offering you {our|a special} {{ "{Tire Rotation and Multi-Point Vehicle Inspection|Full Synthetic Oil Change|Brake System Check|Comprehensive Vehicle Inspection}" | split: "|" | sample }} 
{for only ${{ "{39.95|89.95|59.95}" | split: "|" | sample }}|with up to ${{ "{20|50|75}" | split: "|" | sample }} off}.



{% if last_service %}
  {We noticed|We see} it's been a while since your last visit on {{ last_service }}. 
  {Let's make sure|This is a great opportunity to ensure} your {{ model }} {gets the care it needs|stays in prime condition}.
{% else %}
  {If it's been a while since your last service|To ensure your {{ model }} is in top shape}, now is a great time for a check-up.
{% endif %}



{Don't miss out on this offer|Take advantage of this special deal} {to keep your {{ model }} running at its best|to ensure many more miles of reliable performance|for peace of mind on all your journeys}.



{Schedule your appointment today|Book now} {and let us take care of your {{ model }}|to give your {{ model }} the attention it deserves}!
```

## Additional Personalization Options Using Available Attributes

### Enhanced Version with More Attributes:

```liquid
{% assign miles = customer.Vehicle-Last-RO-Mileage | default: 0 | floor %}
{% assign year = customer.Vehicle-Year | default: "recent" %}
{% assign make = customer.Vehicle-Make | default: "vehicle" %}
{% assign model = customer.Vehicle-Model | default: "vehicle" %}
{% assign last_service = customer.CS-RO-Close-Date | date: "%B %d, %Y" %}
{% assign first_name = customer.Client-First-Name | default: "Valued Customer" %}
{% assign advisor = customer.Advisor-Name | default: "your service advisor" %}
{% assign dealership = customer.Business-Unit-Name | default: "our dealership" %}
{% assign city = customer.Client-City | default: "your area" %}



Hey {{ first_name }},



Your {{ year }} {{ make }} {{ model }} {has been|is} {a trusted companion|serving you well}{% if miles > 0 %} for {{ miles | number_with_delimiter }} miles{% endif %}.



{% if advisor != "your service advisor" %}
  {{ advisor }} from {{ dealership }} wanted to {reach out|connect with you} about your {{ model }}'s maintenance needs.
{% endif %}



{% if miles > 200000 %}
  {With such impressive mileage|After so many miles on the road}, it's crucial to give your {{ model }} some extra attention.
{% elsif miles > 100000 %}
  {With over 100,000 miles|As your vehicle enters its second century of miles}, regular maintenance becomes even more important.
{% elsif miles > 50000 %}
  {As your {{ model }} passes the 50,000-mile mark|With significant mileage under its belt}, it's time for some key maintenance checks.
{% elsif miles > 0 %}
  {Even though your {{ model }} is still relatively young|While your {{ model }} is still breaking in}, regular maintenance is key to keeping it in top shape.
{% else %}
  {To keep your {{ model }} running smoothly|To maintain your {{ model }}'s performance}, it's time for some routine care.
{% endif %}



{% if year == "recent" or year >= 2020 %}
  {As a newer model|With modern technology under the hood}, your {{ model }} benefits from {proactive maintenance|preventive care}.
{% elsif year >= 2010 %}
  {As a modern vehicle|With its advanced systems}, your {{ model }} requires {regular attention|consistent care}.
{% else %}
  {As a seasoned traveler|With its wealth of experience}, your {{ model }} deserves {special attention|expert care}.
{% endif %}



That's why we're offering {{{ city }} customers|you} {our exclusive|a special} {{ "{Tire Rotation and Multi-Point Vehicle Inspection|Full Synthetic Oil Change|Brake System Check|Comprehensive Vehicle Inspection}" | split: "|" | sample }} 
{for only ${{ "{39.95|89.95|59.95}" | split: "|" | sample }}|with up to ${{ "{20|50|75}" | split: "|" | sample }} off}.



{% if last_service %}
  {We noticed|We see} it's been a while since your last visit on {{ last_service }}. 
  {Let's make sure|This is a great opportunity to ensure} your {{ model }} {gets the care it needs|stays in prime condition}.
{% else %}
  {If it's been a while since your last service|To ensure your {{ model }} is in top shape}, now is a great time for a check-up.
{% endif %}



{Don't miss out on this offer|Take advantage of this special deal} {to keep your {{ model }} running at its best|to ensure many more miles of reliable performance|for peace of mind on all your journeys}.



{Schedule your appointment today|Book now} {and let us take care of your {{ model }}|to give your {{ model }} the attention it deserves}!



Best regards,
{{ advisor }}
{{ dealership }}
{% if customer.Advisor-Number %}Direct: {{ customer.Advisor-Number }}{% endif %}
```

## Attribute Mapping Reference

### Original → Corrected Attribute Names:
- `customer.vehicle_last_ro_mileage` → `customer.Vehicle-Last-RO-Mileage`
- `customer.vehicle_year` → `customer.Vehicle-Year`
- `customer.vehicle_make` → `customer.Vehicle-Make`
- `customer.vehicle_model` → `customer.Vehicle-Model`
- `customer.cs_ro_close_date` → `customer.CS-RO-Close-Date`
- `customer.client_first_name` → `customer.Client-First-Name`

### Additional Available Attributes for Enhancement:
- `customer.Advisor-Name` - Personal touch from their service advisor
- `customer.Business-Unit-Name` - Dealership name
- `customer.Client-City` - Location-based personalization
- `customer.Advisor-Number` - Direct contact number
- `customer.Vehicle-Mileage-Out` - Alternative mileage source
- `customer.DMS-Last-RO-Date` - Alternative service date
- `customer.Salesperson/User-Full-Name` - Sales relationship
- `customer.Client-Full-Name` - For more formal communication

## Spintax Note:
The `{option1|option2}` syntax is not native to Liquid/Customer.io. You'll need to implement a custom parser or use Customer.io's A/B testing features to achieve similar variation functionality. 