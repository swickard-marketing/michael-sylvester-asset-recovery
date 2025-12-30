# Comprehensive n8n Workflow Building Prompt for Claude

Based on extensive research and your comprehensive discussion about Swickard Automotive Marketing Automation, here's a detailed prompt engineered specifically for Claude to build a complete n8n workflow that encompasses all the intricacies discussed throughout our conversation.

## **Master Prompt for Claude: Swickard Automotive Marketing Automation n8n Workflow**

```xml

Create a comprehensive n8n workflow JSON for Swickard Auto Group's complete marketing automation system that eliminates 80% of repetitive marketing tasks across 30+ dealerships while ensuring multi-state compliance and achieving 25-40% improvement in marketing efficiency.



You are building an enterprise-grade automotive marketing automation workflow for n8n Cloud hosting that integrates with existing dealership systems, ensures regulatory compliance across multiple states, and leverages AI for intelligent automation decisions.

Previous conversation context: We've established that BuildShip has limitations in A/B testing, n8n provides superior control and extensibility, AI data security requires careful handling of input/output tokens, and the system needs to support both self-hosted security options and comprehensive multi-channel marketing automation.



OBJECTIVE: Build a complete automotive marketing automation workflow that processes Reynolds Focus CRM data, applies state-specific compliance rules, generates AI-powered personalized content, orchestrates multi-channel campaigns, and provides real-time analytics with automated optimization.

TARGET EFFICIENCY: 80% reduction in manual marketing tasks, 25-40% improvement in conversion rates, automated compliance across CA, WA, TX, AK, HI states.

ARCHITECTURE REQUIREMENTS:
- n8n Cloud deployment with webhook triggers
- Reynolds Focus CRM bidirectional integration  
- AWS Bedrock (Claude) for secure AI processing
- Customer.io for email/SMS automation
- Metricool for social media management
- Google Analytics 4 and Power BI for analytics
- DealerOn website automation via Playwright
- Max Digital FTP for inventory synchronization

DATA SECURITY: All AI token processing must use AWS Bedrock with proper secrets management, no customer data leaves controlled environment without encryption.



NODE STRUCTURE REQUIREMENTS:
- Use webhook trigger nodes for real-time CRM integration
- Implement conditional logic nodes for state compliance routing
- Include function nodes for complex data transformations
- Add HTTP request nodes for all external API integrations
- Use set nodes for data formatting and variable management
- Implement error handling with try-catch logic
- Add wait nodes for rate limiting API calls

AUTHENTICATION PATTERN:
Use n8n's built-in credential system for:
- Reynolds Focus CRM API keys
- AWS Bedrock authentication
- Customer.io API credentials
- Google Analytics service account
- Social media platform tokens
Store all credentials using n8n Cloud's encrypted credential management.

DATA FLOW ARCHITECTURE:
1. CRM Trigger → Data Processing → Compliance Check
2. Customer Journey Analysis → AI Content Generation
3. Multi-Channel Orchestration → Campaign Execution
4. Performance Tracking → Optimization Loop



TRIGGER NODES:
- Primary: Webhook Trigger for Reynolds CRM events (new lead, customer update, service reminder)
- Secondary: Schedule Trigger for daily analytics reports and weekly campaign optimization
- Tertiary: Manual Trigger for testing and emergency campaign deployment

CORE PROCESSING NODES:
1. **CRM Data Processing Node**
   - Type: Function Node
   - Purpose: Extract and validate customer data from Reynolds Focus CRM webhooks
   - Logic: Parse JSON payload, validate required fields, enrich with dealership location data
   - Output: Structured customer object with lifecycle stage identification

2. **State Compliance Router Node**
   - Type: Switch Node  
   - Purpose: Route customers based on state location for compliance requirements
   - Conditions: CA, WA, TX, AK, HI with specific legal disclaimer requirements
   - Output: Customer data with appropriate compliance flags

3. **Customer Journey Analysis Node**
   - Type: Function Node with AWS Bedrock integration
   - Purpose: Analyze customer behavior and determine optimal marketing approach
   - Logic: Evaluate purchase history, engagement patterns, vehicle interests
   - Output: Journey stage classification and recommended actions

4. **AI Content Generator Node**
   - Type: HTTP Request Node (AWS Bedrock Claude)
   - Purpose: Generate personalized, compliant marketing content
   - Input: Customer data, compliance requirements, brand guidelines
   - Output: Customized messages, subject lines, call-to-action text

5. **Multi-Channel Campaign Orchestrator**
   - Type: Multiple HTTP Request Nodes
   - Purpose: Coordinate simultaneous campaigns across platforms
   - Integrations: Customer.io (email/SMS), Metricool (social), Google Ads API
   - Logic: Platform-specific formatting and scheduling

6. **Performance Analytics Collector**
   - Type: HTTP Request and Function Nodes
   - Purpose: Gather campaign metrics and calculate KPIs
   - Sources: Google Analytics 4, platform APIs, CRM conversion data
   - Output: Unified performance dashboard data

7. **Automated Optimization Engine**
   - Type: Function Node with conditional logic
   - Purpose: Automatically adjust campaigns based on performance data
   - Logic: A/B test winner determination, budget reallocation, audience refinement
   - Actions: Campaign pausing, bid adjustments, creative rotation

ERROR HANDLING NODES:
- Try-Catch blocks around each API integration
- Fallback nodes for service outages
- Error notification via Slack/email
- Automatic retry logic with exponential backoff



STATE-SPECIFIC REQUIREMENTS:
California (CCPA): Auto-insert privacy policy links, opt-out mechanisms
Washington: Include required vehicle disclosure statements  
Texas: Add mandatory dealer license information
Alaska/Hawaii: Include shipping and delivery disclaimers

FTC CARS RULE AUTOMATION:
- Automatic disclaimer generation for vehicle advertisements
- Price accuracy verification against inventory data
- Required disclosure text insertion based on offer type
- Compliance audit trail logging

IMPLEMENTATION:
Use function nodes with state-specific logic:
```
if (customer.state === 'CA') {
  content.disclaimer += ccpaDisclaimer;
  content.footer += privacyPolicyLink;
} else if (customer.state === 'TX') {
  content.disclaimer += texasLicenseInfo;
}
```



AWS BEDROCK INTEGRATION:
- Use n8n's HTTP Request node with AWS authentication
- All AI processing occurs within customer's AWS account
- No training on customer data - use Claude with strict data handling
- Implement token usage monitoring and cost controls

PROMPT STRUCTURE FOR AI NODES:
```
{{$json.customer}}
{{$json.compliance}}
{{$json.brand}}

Generate a personalized automotive marketing message that:
1. Addresses the customer by name
2. References their specific vehicle interest
3. Includes state-required disclaimers
4. Maintains Swickard's brand voice
5. Includes a clear call-to-action

```

SECURITY MEASURES:
- Encrypt all data in transit using HTTPS
- Use AWS IAM roles for secure API access  
- Log all AI interactions for audit compliance
- Implement data retention policies per state requirements



AUTOMATED A/B TESTING:
- Function node to create message variations
- Random assignment logic for customer segments
- Performance tracking per variant
- Automatic winner selection after statistical significance

DYNAMIC INVENTORY INTEGRATION:
- Real-time vehicle availability checks via Max Digital FTP
- Automatic campaign pausing for sold vehicles
- Pricing update synchronization across all channels
- New inventory campaign triggers

PREDICTIVE ANALYTICS:
- Customer lifetime value calculation
- Churn risk assessment using behavioral data
- Optimal contact timing prediction
- Service reminder automation based on vehicle history

EMERGENCY OVERRIDE SYSTEM:
- Manual trigger for immediate campaign suspension
- Compliance alert system for regulatory changes
- Automatic fallback to manual approval for high-value customers
- System health monitoring with automated notifications



Generate the complete n8n workflow as a properly formatted JSON object that can be directly imported into n8n Cloud. Include:

1. All workflow metadata (name, version, description)
2. Complete node definitions with proper connections
3. All required credentials placeholders
4. Comprehensive error handling
5. Proper data flow connections between nodes
6. Static data configuration for constants
7. Settings for timezone, execution order, and error workflow

Structure the JSON with clear sections for:
- Workflow metadata
- Node definitions array
- Connection mappings
- Settings configuration
- Static data objects

Ensure all node IDs are properly referenced in connections and follow n8n's naming conventions.



The generated workflow must:
✓ Be valid n8n JSON that imports without errors
✓ Include all discussed integrations (Reynolds CRM, AWS Bedrock, Customer.io, etc.)
✓ Implement proper state compliance routing
✓ Have comprehensive error handling
✓ Support the described automation objectives
✓ Include security best practices for credential management
✓ Follow n8n best practices for node naming and organization
✓ Be optimized for n8n Cloud deployment

Test the logic flow mentally to ensure data flows properly from trigger through all processing nodes to final campaign execution and analytics collection.



A successful workflow implementation will:
1. Process incoming CRM webhooks in under 5 seconds
2. Generate state-compliant marketing content automatically
3. Execute multi-channel campaigns simultaneously  
4. Track performance across all touchpoints
5. Automatically optimize based on results
6. Maintain audit trail for compliance reporting
7. Scale to handle 30+ dealerships simultaneously
8. Achieve 80% reduction in manual marketing tasks

```

## **Supplementary Context Prompt for Complex Logic**

For more sophisticated workflow components, use this additional prompt:

```xml

For the automotive marketing workflow, implement these sophisticated features:

CUSTOMER JOURNEY MAPPING:
- Lead scoring algorithm based on engagement metrics
- Automatic lifecycle stage progression triggers
- Cross-dealership customer history consolidation
- Predictive next-best-action recommendations

CAMPAIGN ORCHESTRATION:
- Multi-touch attribution modeling
- Channel preference learning per customer
- Optimal send time prediction per timezone
- Dynamic content personalization based on inventory

PERFORMANCE OPTIMIZATION:
- Real-time bid adjustment algorithms  
- Creative fatigue detection and rotation
- Audience segment performance analysis
- ROI-based budget reallocation automation

DATA INTEGRATION:
- Real-time inventory sync across all marketing channels
- Customer service interaction integration
- Parts and service history utilization
- Cross-dealership customer journey tracking

```

This comprehensive prompt structure leverages Claude's strengths in XML formatting[1][2], explicit instruction following[3], and complex system understanding while incorporating all the technical requirements, security considerations, and business logic discussed throughout your conversation[4][5]. The prompt is designed to generate a production-ready n8n workflow that addresses the full scope of your automotive marketing automation needs[6][7][8].

[1] https://cdn.prod.website-files.com/623952e7f678f73f3096fd25/66eb372cd7ada14bdf585ca0_Best%20Practices%20for%20Prompt%20Engineering.pdf
[2] https://www.vellum.ai/blog/prompt-engineering-tips-for-claude
[3] https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-4-best-practices
[4] https://www.reddit.com/r/n8n/comments/1lnyuv3/i_used_claude_to_build_an_entire_n8n_workflow_in/
[5] https://www.youtube.com/watch?v=hUtineOaedo
[6] https://n8n.io/workflows/categories/marketing/
[7] https://crosstechcom.com/marketing-workflow-automation-n8n/
[8] https://www.wednesday.is/writing-articles/n8n-workflow-automation-complete-implementation-guide
[9] https://www.hostinger.com/tutorials/n8n-workflow-examples
[10] https://docs.n8n.io/courses/level-two/chapter-1/
[11] https://ai-rockstars.com/the-10-best-n8n-workflow-templates-for-automation/
[12] https://www.youtube.com/watch?v=BvBa_npD4Og
[13] https://www.wednesday.is/writing-articles/n8n-custom-nodes-extending-automation-capabilities
[14] https://github.com/jz-clln/150-n8n-templates
[15] https://www.reddit.com/r/n8n/comments/1k47ats/n8n_best_practices_for_clean_profitable/
[16] https://docs.n8n.io/integrations/creating-nodes/build/reference/node-file-structure/
[17] https://www.creative-tim.com/blog/automate/10-best-n8n-templates-to-automate-your-workflow-2/
[18] https://community.n8n.io/t/best-practices-for-workflows-all-in-one-or-separated/18507
[19] https://www.youtube.com/watch?v=BTtRfPZ3HAk
[20] https://docs.n8n.io/workflows/templates/
[21] https://sos-ch-dk-2.exo.io/n8n-worflows/n8n-workflow-creation-best-practices/documenting-workflows.html
[22] https://docs.n8n.io/workflows/components/nodes/
[23] https://n8n.io/workflows/
[24] https://sos-ch-dk-2.exo.io/n8n-worflows/n8n-workflow-creation-best-practices/workflow-best-practices.html
[25] https://www.youtube.com/watch?v=Z9664Q4LJOo
[26] https://github.com/enescingoz/awesome-n8n-templates
[27] https://www.scribd.com/document/863879120/Best-Practices-4-clean-workflows-V01
[28] https://docs.n8n.io/integrations/creating-nodes/overview/
[29] https://n8n.io/supercharge-your-crm/
[30] https://www.reddit.com/r/n8n/comments/1jeuzjg/automation_workflows_that_grew_my_traffic_from/
[31] https://sourceforge.net/software/automotive-crm/integrates-with-n8n/
[32] https://www.youtube.com/watch?v=YV07_zCkx-c
[33] https://n8n.io/workflows/4600-ai-content-generation-for-auto-service-automate-your-social-media/
[34] https://n8n.io/integrations/agile-crm/
[35] https://www.linkedin.com/pulse/building-multichannel-ai-workflows-n8n-langchain-pedro-warick-ilwzf
[36] https://n8n.io/integrations/autom/and/rd-station-crm/
[37] https://www.youtube.com/watch?v=e9t_EYNXaeQ
[38] https://n8n.io/workflows/categories/marketing/?count=50
[39] https://n8n.io/integrations/microsoft-dynamics-crm/
[40] https://theirstack.com/en/technology/n8n/us
[41] https://n8n.io/workflows/categories/marketing/?count=20
[42] https://www.youtube.com/watch?v=25pVXBNVo_8
[43] https://n8n.io/integrations/categories/marketing/
[44] https://n8n.io/workflows/categories/marketing/?count=40
[45] https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.microsoftdynamicscrm/
[46] https://n8n.io/workflows/2173-auto-document-your-n8n-workflows/
[47] https://n8n.io/workflows/5527-access-complete-vehicle-data-with-marketcheck-apis-for-ai-agents/
[48] https://n8n.io/integrations/focuster/and/rd-station-crm/
[49] https://docs.n8n.io/advanced-ai/intro-tutorial/
[50] https://www.cloudthat.com/resources/blog/advanced-prompt-engineering-techniques-for-anthropic-claude
[51] https://n8n.io/workflows/categories/engineering/
[52] https://www.autosuccessonline.com/reynolds-reynolds-focus-redefined-dealership-crm/
[53] https://n8n.io/integrations/flow/and/rd-station-crm/
[54] https://n8n.io/integrations/rd-station-crm/
[55] https://www.youtube.com/watch?v=_DfoL3qOP5Q
[56] https://n8n.io/integrations/claude/and/openai/