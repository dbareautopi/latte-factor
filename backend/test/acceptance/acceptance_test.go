// Package acceptance runs the Gherkin behavior specs as executable acceptance
// tests via godog. The .feature files live in specs/<feature>/backend/ and are
// the source of truth authored by the analyst — they are NOT transcribed by
// hand into Go tests; godog runs them directly.
package acceptance

import (
	"os"
	"testing"

	"github.com/cucumber/godog"
	"github.com/cucumber/godog/colors"
)

// featuresPath points at the SDD specs workspace, where the .feature files
// authored by the analyst live. Override with FEATURES_PATH when needed.
func featuresPath() string {
	if p := os.Getenv("FEATURES_PATH"); p != "" {
		return p
	}
	// Working dir during `go test` is this package: backend/test/acceptance.
	return "../../../specs"
}

// TestFeatures discovers every *.feature under the specs workspace and runs it.
// With no features present it reports zero scenarios and passes.
func TestFeatures(t *testing.T) {
	suite := godog.TestSuite{
		Name:                "acceptance",
		ScenarioInitializer: InitializeScenario,
		Options: &godog.Options{
			Format:   "pretty",
			Paths:    []string{featuresPath()},
			Output:   colors.Colored(os.Stdout),
			TestingT: t, // makes a failing/undefined step fail `go test`
			Strict:   true,
		},
	}

	if status := suite.Run(); status != 0 {
		t.Fatalf("acceptance suite returned non-zero status %d", status)
	}
}
