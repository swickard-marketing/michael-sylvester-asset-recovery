# Complete Guide: Building n8n Workflows with AI-Powered MCP Tools

**A comprehensive guide to developing, testing, and debugging n8n workflows using n8n MCP and Chrome DevTools MCP with Claude Code.**

---

## Table of Contents

1. [Overview](#overview)
2. [Setup & Configuration](#setup--configuration)
3. [Workflow Development Process](#workflow-development-process)
4. [Testing & Debugging](#testing--debugging)
5. [Best Practices](#best-practices)
6. [Real-World Example](#real-world-example)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What This Guide Covers

This guide demonstrates how to leverage two powerful MCP (Model Context Protocol) servers with Claude Code to dramatically accelerate n8n workflow development:

1. **n8n MCP**: Query node capabilities, validate configurations, and access templates
2. **Chrome DevTools MCP**: Real-time monitoring, debugging, and execution visibility

### Why Use MCPs for n8n Development?

**Without MCPs:**
- ❌ Manual trial-and-error with node configurations
- ❌ Copy/paste console logs for debugging
- ❌ Slow iteration cycles (10-15 minutes per bug)
- ❌ Limited visibility into execution state

**With MCPs:**
- ✅ AI validates node configs before testing
- ✅ Real-time execution monitoring
- ✅ Console logs visible automatically
- ✅ Fast iteration cycles (2-3 minutes per bug)
- ✅ Complete visibility into workflow state

**Time Savings:** 80-90% reduction in debugging time for complex workflows

---

## Setup & Configuration

### Prerequisites

- **Claude Code** (VS Code extension) installed
- **Node.js** installed (for npx commands)
- **Google Chrome** browser
- **n8n account** (cloud or self-hosted)
- **Git Bash** or PowerShell (Windows) / Terminal (Mac/Linux)

---

### Step 1: Configure n8n MCP

#### Option A: HTTP Server (Recommended for Cloud n8n)

**1. Create/Edit your Claude Code config:**

**Windows:**
```
C:\Users\YOUR_USERNAME\.claude.json
```

**Mac/Linux:**
```
~/.claude.json
```

**2. Add the n8n MCP server:**

Find the `mcpServers` section (usually around line 1380+) and add:

```json
{
  "mcpServers": {
    "vincentmcleese-n-8-n-mcp": {
      "type": "http",
      "url": "https://server.smithery.ai/@vincentmcleese/n8n-mcp/mcp?api_key=YOUR_API_KEY&profile=YOUR_PROFILE"
    }
  }
}
```

**Get your API key from:** https://smithery.ai/@vincentmcleese/n8n-mcp

#### Option B: Local Server (For Self-Hosted n8n)

```json
{
  "mcpServers": {
    "n8n-mcp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "n8n-mcp"],
      "env": {
        "MCP_MODE": "stdio",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**3. Test the connection:**

Restart Claude Code, then in the terminal run:
```
/mcp
```

You should see `n8n-mcp` listed as connected.

---

### Step 2: Configure Chrome DevTools MCP

**1. Add Chrome DevTools MCP to the same config file:**

```json
{
  "mcpServers": {
    "vincentmcleese-n-8-n-mcp": {
      "type": "http",
      "url": "https://server.smithery.ai/@vincentmcleese/n8n-mcp/mcp?api_key=YOUR_API_KEY"
    },
    "chrome-devtools": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--browser-url=http://127.0.0.1:9222"
      ]
    }
  }
}
```

**2. Launch Chrome with remote debugging:**

**Windows (PowerShell):**
```powershell
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\temp\chrome-debug"
```

**Mac:**
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile
```

**Linux:**
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug-profile
```

**3. Verify the connection:**

Restart Claude Code, then run:
```
/mcp
```

You should see both `n8n-mcp` and `chrome-devtools` connected.

**4. Test Chrome connection:**

Navigate to `https://app.n8n.cloud` in the debug Chrome window, then in Claude Code, the AI can run:
```
List Chrome pages
```

You should see your n8n page listed.

---

## Workflow Development Process

### Phase 1: Planning & Node Selection

**1. Describe Your Workflow**

Tell Claude what you want to build:

```
I need to sync customer orders from our e-commerce API to our PostgreSQL database every hour.
- API endpoint: https://api.myshop.com/orders
- Authentication: Bearer token
- Filter: Only completed orders from last 24 hours
- Transform: Normalize currency and address fields
- Store in orders table with upsert logic
```

**2. Let Claude Use n8n MCP to Research Nodes**

Claude will automatically:
- Search for relevant nodes (`search_nodes`, `list_nodes`)
- Get node documentation (`get_node_documentation`)
- Check node configurations (`get_node_essentials`)
- Find templates (`search_templates`)

**Example AI queries:**
```javascript
// Claude runs these automatically:
search_nodes("HTTP Request")
get_node_essentials("nodes-base.httpRequest")
search_nodes("PostgreSQL")
get_node_essentials("nodes-base.postgres")
list_tasks("api_integration")
```

**3. Review the Proposed Workflow**

Claude will provide:
- Node sequence with explanations
- Configuration requirements
- Authentication needs
- Environment variables needed

---

### Phase 2: Building the Workflow

**1. Create Workflow JSON**

Claude will generate an n8n workflow JSON file with all nodes configured.

**Key sections:**
```json
{
  "name": "Your Workflow Name",
  "nodes": [
    {
      "parameters": { /* node config */ },
      "name": "Node Name",
      "type": "n8n-nodes-base.nodetype",
      "position": [x, y]
    }
  ],
  "connections": { /* node links */ }
}
```

**2. Validate Node Configurations**

Claude can validate each node before you import:

```javascript
// Example: Claude validates the HTTP Request node
validate_node_operation("nodes-base.httpRequest", {
  method: "GET",
  url: "={{$env.API_URL}}/orders",
  authentication: "predefinedCredentialType",
  nodeCredentialType: "httpHeaderAuth",
  sendQuery: true,
  queryParameters: {
    parameters: [
      { name: "status", value: "completed" }
    ]
  }
})
```

This catches configuration errors **before** you test in n8n!

**3. Add Documentation**

Ask Claude to add comprehensive notes to each node:
```
Add detailed documentation to all nodes explaining purpose, configuration, and troubleshooting
```

---

### Phase 3: Testing with Chrome DevTools MCP

**1. Import Workflow into n8n**

- Copy the workflow JSON
- In n8n: Import → Paste JSON
- Save the workflow

**2. Open n8n in Debug Chrome**

Navigate to your workflow in the Chrome window with debugging enabled.

**3. Let Claude Monitor Execution**

Tell Claude:
```
Execute the workflow and monitor the execution in real-time
```

**Claude will:**
- Click "Execute workflow" button
- Open the Logs panel
- Monitor each node's execution
- Check console logs for errors
- View output data

**4. View Real-Time Logs**

Claude can see:
```
✅ Schedule Trigger - Success in 1ms (1 item)
✅ HTTP Request - Success in 2.4s (150 items)
✅ Filter Records - Success in 45ms (87 items)
⏳ Transform Data - Running for 3s...
```

And console.log messages:
```
Log> [Node: "Transform Data"] 'Processed 87 customer records'
Log> [Node: "PostgreSQL"] 'Successfully synced 87 records to database'
```

---

### Phase 4: Debugging Issues

**When a Node Fails:**

**1. Claude Can See Immediately:**
- Which node failed
- Error message
- Console logs
- Input/output data

**2. Example Debug Session:**

```
❌ Parse CSV to JSON - Failed after 0.2s
Error: "No binary data found"

Console: [Node: "Parse CSV to JSON"] 'Item 0: No binary data found'
```

**3. Claude Diagnoses the Issue:**

Using both MCPs, Claude can:
- Check node configuration (`get_node_essentials`)
- View the actual error in Chrome DevTools
- See console debug messages
- Inspect network requests
- Take screenshots of the state

**4. Claude Fixes the Code:**

```javascript
// Before (broken):
const csvText = Buffer.from(binaryData.data, 'base64')

// After (fixed):
const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(i, 'data')
const csvText = binaryDataBuffer.toString('utf-8')
```

**5. Re-test Immediately:**

Claude can re-execute the workflow and verify the fix in real-time.

---

## Testing & Debugging

### Debug Workflow Template

**Always start complex nodes with debug logging:**

```javascript
// Transform Data Code Node (with debugging)
const results = [];

// Log initial state
console.log(`Starting transformation: ${items.length} items`);

for (let i = 0; i < items.length; i++) {
  const item = items[i];

  // Debug data structure
  if (!item.json) {
    console.log(`Item ${i}: No data found`);
    continue;
  }

  console.log(`Item ${i}: Processing record ID ${item.json.id}`);

  try {
    // Your processing logic here
    const transformed = {
      id: item.json.id,
      email: item.json.email?.toLowerCase(),
      country: item.json.address?.country?.toUpperCase() || 'US'
    };

    results.push({ json: transformed });

  } catch (error) {
    console.log(`Item ${i}: Error - ${error.message}`);
  }
}

console.log(`Transformed ${results.length} records from ${items.length} total items`);
return results;
```

**Claude can see all these logs via Chrome DevTools MCP!**

---

### Common Debugging Scenarios

#### Scenario 1: Authentication Errors

**Symptoms:**
- 401 Unauthorized
- 403 Forbidden
- "Invalid credentials" messages

**Debug with Chrome DevTools MCP:**

```javascript
// Claude checks the actual network request:
list_network_requests({resourceTypes: ["xhr", "fetch"]})
get_network_request("https://api.example.com/endpoint")
```

**Claude can see:**
- Request headers (Authorization, API keys)
- Response status code
- Error message from API
- Whether tokens are being sent correctly

**Common Fixes:**
```javascript
// Missing Bearer prefix:
"Authorization": "Bearer {{$env.API_TOKEN}}"

// Wrong environment variable:
"X-API-Key": "={{$env.API_KEY}}"  // Note the =

// Credential not connected:
// Check node → Select correct credential dropdown
```

---

#### Scenario 2: Node Mode Issues

**Symptoms:**
- Only first item processes instead of all items
- Expected 100 outputs, got 1
- Items mysteriously disappear

**Debug Steps:**

1. **Check item counts at each node** (visible in n8n UI)
2. **Verify node mode settings:**
   - "Run Once for Each Item" = loop through items one at a time
   - "Run Once for All Items" = process all items together in one execution

**Visual Indicator:**
```
Input: 100 items
↓
Code Node (Run Once for Each Item)
↓
Output: 100 items ✅

VS

Input: 100 items
↓
Code Node (Run Once for All Items)
↓
Output: 1 item (array of 100) ✅
```

**Fix:**

```json
{
  "parameters": {
    "mode": "runOnceForEachItem",  // or "runOnceForAllItems"
    "jsCode": "// your code"
  }
}
```

**When to use which:**
- **Run Once for Each Item:** Transform individual records (add field, modify value)
- **Run Once for All Items:** Aggregate operations (sum all, combine into one, batch processing)

---

#### Scenario 3: Data Transformation Errors

**Symptoms:**
- TypeError: Cannot read property 'x' of undefined
- Null reference errors
- Unexpected data types

**Debug with Chrome DevTools MCP:**

Add console logging:
```javascript
// Log the problematic data:
console.log('Item structure:', Object.keys(item.json));
console.log('Problematic field:', item.json.address);
console.log('Field type:', typeof item.json.address);
```

**Claude sees:**
```
Log> 'Item structure: email, name, phone'
Log> 'Problematic field: undefined'
Log> 'Field type: undefined'
```

**Fix:** Add null checks
```javascript
// Before (breaks on missing data):
const result = {
  country: item.address.country.toUpperCase()
};

// After (handles missing data):
const result = {
  country: item.address?.country?.toUpperCase() || 'UNKNOWN'
};
```

---

#### Scenario 4: API Rate Limiting

**Symptoms:**
- 429 Too Many Requests
- Workflow fails partway through
- Inconsistent results

**Debug with Chrome DevTools MCP:**

```javascript
// Claude checks network timing:
list_network_requests({resourceTypes: ["xhr", "fetch"]})
```

**See:**
- Request frequency
- Rate limit headers (`X-RateLimit-Remaining`)
- Retry-After values

**Fixes:**
1. Add Wait node between requests
2. Batch API calls (send 10 at once instead of 100)
3. Use caching (don't re-fetch unchanged data)
4. Increase schedule interval

---

#### Scenario 5: Large Data Processing

**Symptoms:**
- Workflow times out
- Memory errors
- n8n becomes unresponsive

**Debug with Chrome DevTools MCP:**

Claude can monitor:
```
HTTP Request: 45s (10,000 records)
Transform Data: 120s (processing...)
Database Insert: timeout after 5 minutes
```

**Fixes:**
1. **Pagination:** Process in chunks
```javascript
// Instead of fetching all at once:
GET /api/users?limit=10000

// Fetch in batches:
GET /api/users?limit=100&offset=0
GET /api/users?limit=100&offset=100
// ... repeat
```

2. **Batch Processing:** Split work across multiple workflow runs
3. **Optimize Queries:** Use database-side filtering instead of Code nodes

---

### Performance Monitoring

**Track Execution Time:**

Claude can see timing for each node:
```
Schedule Trigger: 1ms
HTTP Request (API): 2.4s
Filter Records: 45ms
Transform Data: 1.2s
Database Insert: 8.5s ⚠️ (slow - optimize?)
Send Notification: 890ms
```

**Identify Bottlenecks:**
- Database Insert taking 8.5s for 150 records
- Could be slow due to individual inserts vs batch

**Optimization Ideas:**
- Batch database inserts (chunks of 50)
- Use database bulk insert operations
- Add database indexes on lookup fields
- Implement connection pooling

---

## Best Practices

### 1. Always Validate Before Testing

**Use n8n MCP to validate configurations:**

```javascript
// Before importing workflow:
validate_node_operation("nodes-base.googleSheets", {
  authentication: "oAuth2",
  resource: "sheet",
  operation: "append",
  documentId: "YOUR_SHEET_ID",
  sheetName: "Sheet1"
})
```

**Catches issues like:**
- Missing required fields
- Invalid operation combinations
- Incorrect data types

---

### 2. Use Comprehensive Logging

**In all Code nodes:**

```javascript
console.log(`Starting: ${description}`);
console.log(`Input: ${items.length} items`);

// ... processing ...

console.log(`Success: Processed ${results.length} items`);
console.log(`Errors: ${errors.length}`);
```

**Claude can monitor these via Chrome DevTools MCP.**

---

### 3. Handle Errors Gracefully

**Always wrap in try/catch:**

```javascript
for (let i = 0; i < items.length; i++) {
  try {
    // Process item
  } catch (error) {
    console.log(`Item ${i} failed: ${error.message}`);
    // Continue processing other items
    continue;
  }
}
```

---

### 4. Document As You Build

**Add notes to every node:**

```json
{
  "notes": "🌐 HTTP REQUEST - Fetch customer orders\n\n
PURPOSE: Retrieves completed orders from e-commerce API\n
CONFIGURATION: Uses API_URL and API_TOKEN env vars\n
QUERY PARAMS: status=completed, date filter last 24 hours\n
OUTPUT: Array of order objects with customer/product data\n
TROUBLESHOOTING: Check Bearer token if 401 errors occur"
}
```

**Claude can generate these automatically!**

---

### 5. Test Incrementally

**Don't build entire workflow at once:**

1. Build first 2-3 nodes
2. Test with Chrome DevTools monitoring
3. Verify output data
4. Add next 2-3 nodes
5. Repeat

**Faster debugging when issues are isolated!**

---

## Real-World Examples

### Example 1: REST API to Database Sync

**Objective:** Fetch customer data from an e-commerce API and store in PostgreSQL database.

**Requirements:**
- API: https://api.example-shop.com/customers
- Authentication: Bearer token
- Filter: Only customers who made purchases in last 30 days
- Transform: Normalize address fields
- Store: PostgreSQL database table
- Schedule: Run every 6 hours

---

### Step 1: Planning

**Told Claude:**
```
Build a workflow to sync customer data from our e-commerce API to PostgreSQL:
- API: https://api.example-shop.com/customers
- Use Bearer token authentication
- Filter for customers with recent purchases (last 30 days)
- Normalize address fields (country codes, zip formats)
- Store in customers table
- Run every 6 hours
```

**Claude used n8n MCP to research:**
```javascript
search_nodes("HTTP Request")
get_node_documentation("nodes-base.httpRequest")
search_nodes("PostgreSQL")
get_node_essentials("nodes-base.postgres")
```

**Proposed workflow:**
1. Schedule Trigger (every 6 hours)
2. HTTP Request (GET /customers)
3. Filter Customers (IF node - recent purchases)
4. Transform Data (Code node - normalize addresses)
5. PostgreSQL Insert (batch insert)
6. Send Notification (Slack/Email on completion)

---

### Step 2: Initial Build

**Claude generated workflow JSON with validated configurations.**

**Key validations performed:**
- HTTP Request node: `validate_node_operation()` ✅
- PostgreSQL node: `validate_node_operation()` ✅
- Code nodes: Syntax validated ✅

---

### Step 3: First Test

**Imported into n8n, opened in debug Chrome.**

**Told Claude:**
```
Execute the workflow and monitor execution
```

**Claude saw in real-time:**
```
✅ Schedule Trigger - 1ms (1 item)
❌ HTTP Request - Failed: 401 Unauthorized
```

**Issue:** Authentication token not being sent correctly.

---

### Step 4: Debug Issue #1

**Claude checked network requests via Chrome DevTools:**
```javascript
list_network_requests({resourceTypes: ["xhr", "fetch"]})
get_network_request("https://api.example-shop.com/customers")
```

**Found:** Authorization header missing "Bearer" prefix.

**Fix:**
```json
{
  "headers": {
    "Authorization": "Bearer {{$env.API_TOKEN}}"
  }
}
```

**Re-tested:** ✅ API request successful (returned 150 customers)

---

### Step 5: Debug Issue #2

**Transform Data node failed:**
```
❌ Transform Data - TypeError: Cannot read property 'country' of undefined
```

**Claude saw console:**
```
Log> [Node: "Transform Data"] 'Processing 150 customers'
Log> [Node: "Transform Data"] 'Error at item 23: address is undefined'
```

**Issue:** Some customers don't have address data.

**Fix:** Added null checks
```javascript
// Before:
const normalized = {
  country: item.address.country.toUpperCase(),
  zip: formatZip(item.address.zip)
};

// After:
const normalized = {
  country: item.address?.country?.toUpperCase() || 'US',
  zip: item.address?.zip ? formatZip(item.address.zip) : null
};
```

**Re-tested:** ✅ Transform successful (150 customers normalized)

---

### Step 6: Debug Issue #3

**PostgreSQL Insert node failed:**
```
❌ PostgreSQL - Error: duplicate key violates unique constraint
```

**Claude checked console and network:**
```
Log> [Node: "PostgreSQL"] 'Attempting to insert 150 records'
Error> duplicate key value violates unique constraint "customers_email_key"
```

**Issue:** Trying to insert existing customers.

**Fix:** Changed INSERT to UPSERT
```sql
-- Before: INSERT
INSERT INTO customers (email, name, country) VALUES ($1, $2, $3)

-- After: UPSERT (INSERT ... ON CONFLICT)
INSERT INTO customers (email, name, country)
VALUES ($1, $2, $3)
ON CONFLICT (email)
DO UPDATE SET name = $2, country = $3, updated_at = NOW()
```

**Re-tested:** ✅ Database sync successful (150 customers upserted)

---

### Step 7: Final Test

**Executed workflow with Chrome DevTools monitoring:**

```
✅ Schedule Trigger - 1ms (1 item)
✅ HTTP Request - 2.4s (150 customers)
✅ Filter Customers - 45ms (87 with recent purchases)
✅ Transform Data - 120ms (87 normalized)
✅ PostgreSQL Insert - 890ms (87 upserted)
✅ Send Notification - 1.2s (Slack message sent)
```

**Console:**
```
Log> [Node: "Transform Data"] 'Normalized 87 customer records'
Log> [Node: "PostgreSQL"] 'Successfully synced 87 customers to database'
```

**✅ Workflow working perfectly!**

---

### Example 2: Webhook to Multi-Channel Notifications

**Objective:** Receive form submissions via webhook and send notifications to Slack, Email, and SMS.

**Debug Journey:**

1. **Webhook node** - Initially returned 404 (wrong HTTP method accepted)
2. **Data parsing** - JSON body not extracted correctly
3. **Slack node** - Rate limit exceeded (429 error)
4. **Email node** - Template variables not rendering

**All debugged in real-time with Chrome DevTools MCP showing:**
- Network requests to each service
- Console logs from data transformations
- Error messages from rate limiting
- Execution timing at each step

---

### Time Comparison

**Without MCPs:**
- Trial and error: ~2 hours per workflow
- Manual debugging: ~15 minutes per issue
- Total: 3-4 hours for complex workflows

**With MCPs:**
- AI-guided development: ~30 minutes
- Real-time debugging: ~2-3 minutes per issue
- Total: ~45 minutes

**80-90% time savings!**

---

## Troubleshooting

### Chrome DevTools MCP Issues

#### Issue: "Failed to fetch browser webSocket"

**Cause:** Chrome not running with debugging enabled.

**Fix:**
```powershell
# Windows
Start-Process "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList "--remote-debugging-port=9222","--user-data-dir=C:\temp\chrome-debug"

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug
```

**Verify:**
```powershell
Test-NetConnection -ComputerName 127.0.0.1 -Port 9222
# Should show: TcpTestSucceeded: True
```

---

#### Issue: "No page selected"

**Cause:** Need to navigate to n8n in the debug Chrome.

**Fix:**
1. Open debug Chrome window
2. Navigate to `https://app.n8n.cloud`
3. In Claude Code: `/mcp` to reconnect
4. Claude can now see pages

---

#### Issue: Can't see console logs

**Cause:** Logs might be in iframe or not yet written.

**Fix:**
1. Wait for node to complete execution
2. Run `list_console_messages()` again
3. Check browser console manually (F12) as backup

---

### n8n MCP Issues

#### Issue: "Transport is closed"

**Cause:** MCP server disconnected.

**Fix:**
```
/mcp
```

This reconnects all MCP servers.

---

#### Issue: Can't validate node

**Cause:** Wrong node type format.

**Fix:**
```javascript
// Wrong:
validate_node_operation("ftp", {...})

// Correct:
validate_node_operation("nodes-base.ftp", {...})
```

Always use full node type with `nodes-base.` prefix!

---

## Advanced Techniques

### 1. Parallel Debugging Multiple Workflows

**Open multiple Chrome tabs with different workflows:**

```javascript
// Claude can list all pages
list_pages()

// Output:
// 0: Workflow A
// 1: Workflow B
// 2: Workflow C

// Select specific workflow
select_page(1)

// Monitor that workflow
```

---

### 2. Network Request Analysis

**For API integration debugging:**

```javascript
// List all API calls
list_network_requests({
  resourceTypes: ["xhr", "fetch"]
})

// Get specific request details
get_network_request("https://api.example.com/endpoint")
```

**See:**
- Request headers (auth tokens, content-type)
- Request body (payload data)
- Response status (200, 404, 500)
- Response body (error messages)

---

### 3. Performance Profiling

**For slow workflows:**

```javascript
// Start performance trace
performance_start_trace({
  reload: false,
  autoStop: false
})

// Execute workflow
// ...

// Stop trace
performance_stop_trace()

// Analyze insights
performance_analyze_insight("LCPBreakdown")
```

**Identifies:**
- Slow network requests
- JavaScript execution time
- Memory usage
- Rendering bottlenecks

---

### 4. Automated Testing

**Create test scenarios:**

```javascript
// Test Case 1: Empty API response
// Expected: 0 items after HTTP Request node

// Test Case 2: API returns no completed orders
// Expected: 0 items after Filter node

// Test Case 3: API returns 150 orders, 87 completed
// Expected: 87 items transformed and inserted to database
```

**Claude can execute and verify each test automatically!**

---

## Summary

### Key Takeaways

1. **n8n MCP** = Validate configs before testing
2. **Chrome DevTools MCP** = Real-time execution monitoring
3. **Combined** = 80-90% faster development & debugging

### Recommended Workflow

```
1. Plan workflow with Claude + n8n MCP
   ↓
2. Claude validates all node configs
   ↓
3. Generate workflow JSON
   ↓
4. Import to n8n
   ↓
5. Execute with Chrome DevTools monitoring
   ↓
6. Debug issues in real-time
   ↓
7. Fix and re-test immediately
   ↓
8. Deploy to production
```

### Time Savings Per Workflow

- **Simple workflows** (5-10 nodes): 50% faster
- **Medium workflows** (10-20 nodes): 70% faster
- **Complex workflows** (20+ nodes): 85% faster

---

## Additional Resources

- **n8n MCP GitHub:** https://github.com/czlonkowski/n8n-mcp
- **Chrome DevTools MCP:** https://github.com/ChromeDevTools/chrome-devtools-mcp
- **n8n Documentation:** https://docs.n8n.io
- **Claude Code Docs:** https://docs.claude.com/en/docs/claude-code

---

## Support

**For issues with this guide or MCP setup:**

1. Check the [Troubleshooting](#troubleshooting) section
2. Verify MCP connections: `/mcp`
3. Check Claude Code logs
4. Report issues to respective MCP repositories

---

**Last Updated:** October 14, 2025
**Version:** 1.0
**Author:** Built with Claude Code + n8n MCP + Chrome DevTools MCP

---

*This guide is designed for universal application across all n8n workflow types, from simple API integrations to complex multi-step data pipelines.*
