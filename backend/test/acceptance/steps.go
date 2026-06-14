package acceptance

import (
	"context"

	"github.com/cucumber/godog"
)

// world holds per-scenario state shared across step definitions. Reset it in a
// Before hook so scenarios stay isolated.
type world struct {
	// e.g. httpServer, lastResponse, lastErr — add fields as features need them.
}

// InitializeScenario wires step definitions for every feature. qa-engineer adds
// the Given/When/Then bindings here (or in feature-scoped *_steps.go files in
// this package) so the analyst's .feature scenarios execute end to end.
//
// Keep this file as the single registration entry point. Add steps such as:
//
//	w := &world{}
//	sc.Before(func(ctx context.Context, _ *godog.Scenario) (context.Context, error) {
//	    *w = world{} // reset state per scenario
//	    return ctx, nil
//	})
//	sc.Step(`^I add an expense of \$(\d+\.\d{2}) for "([^"]*)"$`, w.iAddAnExpense)
func InitializeScenario(sc *godog.ScenarioContext) {
	w := &world{}

	sc.Before(func(ctx context.Context, _ *godog.Scenario) (context.Context, error) {
		*w = world{} // isolate state between scenarios
		return ctx, nil
	})

	// Step bindings go here as features are implemented. See doc comment above.
	_ = w
}
