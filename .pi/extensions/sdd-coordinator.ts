/**
 * SDD Coordinator Extension
 * 
 * Two-phase workflow with better UX:
 * Phase 1: Interactive spec refinement → pi generates and saves Gherkin
 * Phase 2: Automated implementation loop → runs until failure or completion
 * 
 * Usage: /sdd <feature-name>
 */
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import * as fs from "node:fs";
import * as path from "node:path";

interface WorkflowState {
  feature: string;
  phase: string;
  featureDir: string;
  startedAt: string;
}

export default function (pi: ExtensionAPI) {
  let currentState: WorkflowState | null = null;

  // Load state from session on startup
  pi.on("session_start", async (_event, ctx) => {
    for (const entry of ctx.sessionManager.getEntries()) {
      if (entry.type === "custom" && entry.customType === "sdd-state") {
        currentState = entry.data as WorkflowState;
        ctx.ui.notify(`SDD Workflow active: ${currentState.feature}`, "info");
        break;
      }
    }
  });

  // PATH PROTECTION: Block writes to frontend/ directory
  pi.on("tool_call", async (event, ctx) => {
    if (event.toolName !== "write" && event.toolName !== "edit") {
      return undefined;
    }

    const filePath = event.input.path as string;
    if (filePath.includes("frontend/")) {
      if (ctx.hasUI) {
        ctx.ui.notify(`🚫 Blocked: Cannot write to frontend/`, "error");
      }
      return { block: true, reason: `Agents cannot write to frontend/ directory` };
    }

    return undefined;
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 1: Interactive Spec Refinement
  // ═══════════════════════════════════════════════════════════════════

  // /sdd: Start workflow
  pi.registerCommand("sdd", {
    description: "Start Spec-Driven Development workflow",
    handler: async (args, ctx) => {
      const featureName = args.trim().toLowerCase().replace(/\s+/g, "-");
      if (!featureName) {
        ctx.ui.notify("Usage: /sdd <feature-name>", "error");
        return;
      }

      // Validate name
      if (!/^[a-z0-9-]+$/.test(featureName)) {
        ctx.ui.notify("Feature name: only lowercase letters, numbers, and hyphens", "error");
        return;
      }

      // Create directory structure
      const featureDir = path.join(ctx.cwd, "specs", featureName);
      if (fs.existsSync(featureDir)) {
        ctx.ui.notify(`Feature "${featureName}" already exists`, "error");
        return;
      }

      fs.mkdirSync(featureDir, { recursive: true });
      fs.mkdirSync(path.join(featureDir, "contracts"), { recursive: true });
      fs.mkdirSync(path.join(featureDir, "contracts", "examples", "requests"), { recursive: true });
      fs.mkdirSync(path.join(featureDir, "contracts", "examples", "responses"), { recursive: true });
      fs.mkdirSync(path.join(featureDir, "tests", "unit"), { recursive: true });
      fs.mkdirSync(path.join(featureDir, "tests", "e2e"), { recursive: true });

      currentState = {
        feature: featureName,
        phase: "spec",
        featureDir,
        startedAt: new Date().toISOString(),
      };

      pi.appendEntry("sdd-state", currentState);
      ctx.ui.notify(`Created: specs/${featureName}/`, "success");

      // Start interactive conversation
      pi.sendMessage({
        customType: "sdd-welcome",
        content: `## SDD: ${featureName}

I'll help you create a Gherkin behavioral specification.

**Describe your feature:**
- What should it do?
- Who uses it?
- What are the main actions?
- What could go wrong?

I'll refine your description into Gherkin scenarios. When you're happy, I'll save it automatically.`,
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // /sdd-save: Pi generates and saves Gherkin from conversation context
  pi.registerCommand("sdd-save", {
    description: "Save Gherkin spec from current conversation",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow. Use /sdd <feature> first.", "error");
        return;
      }

      const gherkinPath = path.join(currentState.featureDir, "behavior.feature");
      
      // User can provide Gherkin directly, or we ask pi to generate from context
      let gherkinContent: string;
      
      if (args.trim().includes("Feature:")) {
        // User pasted Gherkin directly
        gherkinContent = args.trim();
      } else {
        // Generate from conversation context
        gherkinContent = args.trim() || "(Generate from our conversation)";
      }
      
      // Save placeholder - pi will fill in the actual content
      fs.writeFileSync(gherkinPath, gherkinContent);
      ctx.ui.notify(`Spec saved: specs/${currentState.feature}/behavior.feature`, "success");

      pi.sendMessage({
        customType: "sdd-spec-saved",
        content: `## Spec Saved! ✅

File: \`specs/${currentState.feature}/behavior.feature\`

### Ready for Implementation

Start the automated loop:
\`\`\`
/sdd-next
\`\`\`

This will run: contract → tests → implementation → review

Or keep editing:
\`\`\`
/sdd-edit-spec    # Open spec for editing
\`\`\``,
        display: true,
      }, { deliverAs: "followUp" });
    }
  });

  // /sdd-edit-spec: Edit the spec
  pi.registerCommand("sdd-edit-spec", {
    description: "Edit the Gherkin spec",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow.", "error");
        return;
      }

      const gherkinPath = path.join(currentState.featureDir, "behavior.feature");
      
      if (!fs.existsSync(gherkinPath)) {
        ctx.ui.notify("No spec yet. Use /sdd-save first.", "error");
        return;
      }

      const currentSpec = fs.readFileSync(gherkinPath, "utf8");
      
      pi.sendMessage({
        customType: "sdd-edit-spec",
        content: `## Current Spec

\`\`\`gherkin
${currentSpec}
\`\`\`

**Describe what to change**, and I'll update the spec. For example:
- "Add a scenario for duplicate expenses"
- "Change the error message for invalid amounts"
- "Add validation for date range"

Or paste a complete new spec with /sdd-save.`,
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // ═══════════════════════════════════════════════════════════════════
  // PHASE 2: Automated Implementation Loop
  // ═══════════════════════════════════════════════════════════════════

  // /sdd-next: Step-by-step implementation (manual advance)
  pi.registerCommand("sdd-next", {
    description: "Start/continue implementation (step by step)",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow. Use /sdd <feature> first.", "error");
        return;
      }

      // Verify spec exists
      const gherkinPath = path.join(currentState.featureDir, "behavior.feature");
      if (!fs.existsSync(gherkinPath)) {
        ctx.ui.notify("No spec found. Complete Phase 1 first with /sdd-save.", "error");
        return;
      }

      // Start the loop
      currentState.phase = "contract";
      pi.appendEntry("sdd-state", currentState);

      pi.sendMessage({
        customType: "sdd-loop-start",
        content: getPhasePrompt("contract", currentState) + "\n\nWhen complete, use /sdd-phase-complete to advance.",
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // /sdd-auto: Fully automated implementation loop
  pi.registerCommand("sdd-auto", {
    description: "Run full implementation automatically (stops on failure)",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow. Use /sdd <feature> first.", "error");
        return;
      }

      // Verify spec exists
      const gherkinPath = path.join(currentState.featureDir, "behavior.feature");
      if (!fs.existsSync(gherkinPath)) {
        ctx.ui.notify("No spec found. Complete Phase 1 first with /sdd-save.", "error");
        return;
      }

      // Start the automated loop
      currentState.phase = "contract";
      pi.appendEntry("sdd-state", currentState);

      const autoPrompt = `
## 🚀 Fully Automated Implementation Loop

**Feature:** ${currentState.feature}
**Spec:** ${gherkinPath}

I will now run ALL phases automatically. **Do not use /sdd-phase-complete** — I will chain everything myself.

### Phase 1: Contract

Use the **subagent** tool to spawn the **contract-dev** agent.

Task: Create OpenAPI contract for "${currentState.feature}"

1. Read the Gherkin: ${gherkinPath}
2. Create OpenAPI at: ${path.join(currentState.featureDir, "contracts", "openapi.yaml")}
3. Create examples in: ${path.join(currentState.featureDir, "contracts", "examples")}

**IMPORTANT: When the contract agent finishes, immediately proceed to Phase 2 (unit tests) without waiting for user input.**

### Phase 2: Unit Tests
After contract is done, spawn **qa-engineer** agent.
Task: Create unit tests
Save to: ${path.join(currentState.featureDir, "tests", "unit")}

### Phase 3: E2E Tests
After unit tests, spawn **qa-engineer** agent.
Task: Create e2e tests
Save to: ${path.join(currentState.featureDir, "tests", "e2e")}

### Phase 4: Implementation
After e2e tests, spawn **developer** agent.
Task: Implement in Go
Write to: \`backend/internal/\`

### Phase 5: Run Tests
After implementation, spawn **qa-engineer** agent.
Task: Run \`go test ./... -v\` in backend/

### Phase 6: Review
If tests pass, spawn **reviewer** agent.
Task: Review code quality

---

**STOP and report to user ONLY if:**
- Tests fail (use /sdd-feedback to report)
- Review finds critical issues
- Any agent errors

**Otherwise, continue to next phase automatically.**
`;

      pi.sendMessage({
        customType: "sdd-auto-start",
        content: autoPrompt,
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // /sdd-phase-complete: Called after each subagent finishes
  pi.registerCommand("sdd-phase-complete", {
    description: "Advance to next phase in loop",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow.", "error");
        return;
      }

      const phases = ["contract", "unit-tests", "e2e-tests", "implementation", "test-run", "review", "complete"];
      const currentIdx = phases.indexOf(currentState.phase);
      
      if (currentIdx >= phases.length - 1) {
        // Workflow complete
        currentState.phase = "complete";
        pi.appendEntry("sdd-state", currentState);
        
        pi.sendMessage({
          customType: "sdd-complete",
          content: `## SDD Workflow Complete! 🎉

**Feature:** ${currentState.feature}

All phases completed successfully.

### Deliverables
- Spec: \`specs/${currentState.feature}/behavior.feature\`
- Contract: \`specs/${currentState.feature}/contracts/openapi.yaml\`
- Tests: \`specs/${currentState.feature}/tests/\`
- Implementation: Passing tests in \`backend/\``,
          display: true,
        }, { deliverAs: "followUp" });
        return;
      }

      // Move to next phase
      const nextPhase = phases[currentIdx + 1];
      currentState.phase = nextPhase;
      pi.appendEntry("sdd-state", currentState);

      // Generate prompt for next phase
      const prompt = getPhasePrompt(nextPhase, currentState);
      pi.sendMessage({
        customType: "sdd-next-phase",
        content: prompt,
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // /sdd-feedback: Handle failures - loop back to developer
  pi.registerCommand("sdd-feedback", {
    description: "Report failure and loop back to developer",
    handler: async (args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow.", "error");
        return;
      }

      currentState.phase = "implementation";
      pi.appendEntry("sdd-state", currentState);

      pi.sendMessage({
        customType: "sdd-feedback",
        content: `
## Test Failure - Looping Back

Use the **subagent** tool to spawn the **developer** agent.

Task: Fix failing tests for "${currentState.feature}"

Failures:
\`\`\`
${args || "No details provided."}
\`\`\`

Read:
- Contract: ${path.join(currentState.featureDir, "contracts", "openapi.yaml")}
- Tests: ${path.join(currentState.featureDir, "tests")}

After fixing, use /sdd-phase-complete to continue.`,
        display: true,
      }, { deliverAs: "followUp", triggerTurn: true });
    }
  });

  // /sdd-status: Show current state
  pi.registerCommand("sdd-status", {
    description: "Show workflow status",
    handler: async (_args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow.", "info");
        return;
      }

      const phases = ["spec", "contract", "unit-tests", "e2e-tests", "implementation", "test-run", "review", "complete"];
      const currentIdx = phases.indexOf(currentState.phase);

      pi.sendMessage({
        customType: "sdd-status",
        content: `## SDD Status: ${currentState.feature}

**Phase:** ${currentState.phase}

${phases.map((p, i) => {
          const icon = i < currentIdx ? "✅" : i === currentIdx ? "🔄" : "⏳";
          return `${icon} ${p}`;
        }).join("\n")}

### Commands
- \`/sdd-edit-spec\` — Edit the Gherkin
- \`/sdd-next\` — Start/continue implementation loop
- \`/sdd-feedback <details>\` — Report failure
- \`/sdd-complete\` — Force complete`,
        display: true,
      }, { deliverAs: "followUp" });
    }
  });

  // /sdd-complete: Force complete
  pi.registerCommand("sdd-complete", {
    description: "Force complete the workflow",
    handler: async (_args, ctx) => {
      if (!currentState) {
        ctx.ui.notify("No active SDD workflow.", "error");
        return;
      }

      currentState.phase = "complete";
      pi.appendEntry("sdd-state", currentState);

      ctx.ui.notify(`SDD Workflow complete: ${currentState.feature}`, "success");
    }
  });
}

// ═══════════════════════════════════════════════════════════════════
// Phase Prompts
// ═══════════════════════════════════════════════════════════════════

function getPhasePrompt(phase: string, state: WorkflowState): string {
  const feature = state.feature;
  const dir = state.featureDir;
  
  const prompts: Record<string, string> = {
    "unit-tests": `
## Phase: Unit Tests

Use the **subagent** tool to spawn the **qa-engineer** agent.

Task: Create unit tests for "${feature}"

Read:
- Gherkin: ${path.join(dir, "behavior.feature")}
- Contract: ${path.join(dir, "contracts", "openapi.yaml")}

Save to: ${path.join(dir, "tests", "unit")}

When complete, use /sdd-phase-complete to continue.
`,

    "e2e-tests": `
## Phase: E2E Tests

Use the **subagent** tool to spawn the **qa-engineer** agent.

Task: Create e2e tests for "${feature}"

Read:
- Gherkin: ${path.join(dir, "behavior.feature")}
- Contract: ${path.join(dir, "contracts", "openapi.yaml")}

Save to: ${path.join(dir, "tests", "e2e")}

When complete, use /sdd-phase-complete to continue.
`,

    "implementation": `
## Phase: Implementation

Use the **subagent** tool to spawn the **developer** agent.

Task: Implement "${feature}" in Go

Read:
- Contract: ${path.join(dir, "contracts", "openapi.yaml")}
- Unit tests: ${path.join(dir, "tests", "unit")}
- E2E tests: ${path.join(dir, "tests", "e2e")}

Write code in: \`backend/internal/\`

When complete, use /sdd-phase-complete to continue.
`,

    "test-run": `
## Phase: Run Tests

Use the **subagent** tool to spawn the **qa-engineer** agent.

Task: Run all tests for "${feature}"

Execute:
\`\`\`bash
cd backend && go test ./... -v
\`\`\`

If tests pass: use /sdd-phase-complete
If tests fail: use /sdd-feedback <error details>
`,

    "review": `
## Phase: Code Review

Use the **subagent** tool to spawn the **reviewer** agent.

Task: Review implementation for "${feature}"

Review:
- Contract: ${path.join(dir, "contracts", "openapi.yaml")}
- Code in: \`backend/internal/\`

If approved: use /sdd-phase-complete
If critical issues: use /sdd-feedback <details>
`
  };

  return prompts[phase] || `Unknown phase: ${phase}`;
}
