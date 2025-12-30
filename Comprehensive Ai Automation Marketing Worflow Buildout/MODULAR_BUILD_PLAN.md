# Modular JOMP Brain Architecture - Build Plan

## Monday Fresh Start - Modular Structure

### Core Architecture Components

#### 1. JOMP Brain (Master Orchestrator with Linear Paths)
- Central decision engine with HARDCODED paths (no AI hallucination risk)
- Linear route by stage logic - deterministic customer flows
- Event processing with validation
- State management with guards
- AI integration LIMITED to specific agents for specific tasks:
  - Content recommendation agent
  - Performance analysis agent  
  - Inventory prioritization agent
- NO AI decision-making for customer journey paths

#### 2. BigQuery (Data Layer)
- Single source of truth
- Real-time state tracking
- Historical analytics
- Content library (static, GM-controlled for website)
- Monthly engagement analytics for recommendations

#### 3. Route by Stage (Base Paths - HARDCODED)
- Awareness path → Consideration (score >= 30)
- Consideration path → Intent (score >= 75 OR test_drive = true)
- Intent path → Conversion (quote_requested = true)
- Conversion path → Retention (purchase_complete = true)
- NO DYNAMIC PATH CREATION - all paths predetermined

### Critical Design Constraints

1. **Website Content Remains Static**
   - Website content controlled by dealership GM
   - NO dynamic personalization on website
   - Monthly recommendations PROVIDED to marketing team
   - Team manually updates based on inventory needs and engagement data

2. **AI Scope Limitations**
   - AI provides RECOMMENDATIONS not decisions
   - All customer routing through HARDCODED rules
   - Specific AI agents for isolated tasks (tmux architecture)
   - Each agent has single responsibility to reduce errors

3. **Content Management Structure**
   - Modular content per department (Pre-owned, Sales, Service)
   - Content selected by RULES not AI
   - Monthly intelligence reports for human decision-making
   - Marketing team maintains control of actual content

### Modular Design Principles

1. **Separation of Concerns**
   - JOMP handles routing (deterministic)
   - AI provides insights (advisory only)
   - BigQuery stores state
   - Stage modules execute actions

2. **Plug-and-Play Modules**
   - Each stage is independent
   - Channels as microservices
   - Content as configuration
   - Modules can be swapped without breaking linear paths

3. **Event-Driven Architecture**
   - All actions trigger events
   - Events update state
   - State changes trigger PREDETERMINED next actions
   - No dynamic decision trees

### Build Order for Monday

1. **BigQuery Schema Setup**
   - Core tables structure
   - Event streaming setup
   - State management tables
   - Content library tables (static)
   - Monthly analytics aggregation tables

2. **JOMP Brain Core (Deterministic Engine)**
   - Hardcoded decision trees
   - Linear path validation
   - Event processor with guards
   - Route controller (rule-based)
   - NO dynamic AI routing

3. **Stage Base Modules (Linear Paths)**
   - Standard input/output contracts
   - Consistent data model
   - Modular connections
   - Each stage has FIXED entry/exit criteria
   - No skip-stage capabilities

4. **AI Agent Layer (Isolated Tasks)**
   - Content recommendation agent (monthly)
   - Inventory analysis agent (weekly)
   - Performance reporting agent (monthly)
   - Each agent in separate container/process (tmux)
   - Agents provide DATA not DECISIONS

5. **Content Management Interface**
   - Monthly recommendation dashboard
   - GM priority input form
   - Marketing team content library
   - Performance tracking (human review)

### Key Improvements from Current Build

- **Predictable Behavior**: Hardcoded paths eliminate uncertainty
- **AI Safety**: AI limited to recommendations, not customer routing
- **GM Control**: Website remains static per dealership requirements  
- **True Modularity**: Swap modules without breaking linear paths
- **Centralized State**: BigQuery as single source of truth
- **Event-Driven**: Immediate response to customer actions
- **Single Brain**: JOMP controls all paths with deterministic logic

### Risk Mitigation

1. **No AI Hallucination in Critical Paths**
   - Customer journey paths are hardcoded
   - AI only provides analytics and recommendations
   - Human approval required for all content changes

2. **Failsafe Mechanisms**
   - If score calculation fails → default to current stage
   - If event processing fails → queue for retry
   - If AI agent fails → system continues with last known good state

3. **Audit Trail**
   - Every state transition logged
   - Every decision point recorded
   - Monthly review of path effectiveness

## Files Archived: 2025-08-08
All previous work saved in archive/2025-08-08_pre_modular_build/ for reference