package integration

import (
	"context"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type StandardInput struct {
	Name        string `json:"name"`
	Description string `json:"description,omitempty"`
	CourseType  string `json:"course_type"`
	Gender      string `json:"gender"`
}

type StandardTimeInput struct {
	Event    string `json:"event"`
	AgeGroup string `json:"age_group"`
	TimeMs   int    `json:"time_ms"`
}

type StandardImportInput struct {
	Name        string              `json:"name"`
	Description string              `json:"description,omitempty"`
	CourseType  string              `json:"course_type"`
	Gender      string              `json:"gender"`
	Times       []StandardTimeInput `json:"times"`
}

type Standard struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	CourseType  string `json:"course_type"`
	Gender      string `json:"gender"`
	IsPreloaded bool   `json:"is_preloaded"`
}

type StandardTime struct {
	Event         string `json:"event"`
	AgeGroup      string `json:"age_group"`
	TimeMs        int    `json:"time_ms"`
	TimeFormatted string `json:"time_formatted"`
}

type StandardWithTimes struct {
	Standard
	Times []StandardTime `json:"times"`
}

type StandardList struct {
	Standards []Standard `json:"standards"`
}

func TestStandardAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("POST /standards creates a standard", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := StandardInput{
			Name:        "Test Standard",
			Description: "A test time standard",
			CourseType:  "25m",
			Gender:      "female",
		}

		rr := client.Post("/api/v1/standards", input)

		assert.Equal(t, http.StatusCreated, rr.Code, "expected 201, got %d: %s", rr.Code, rr.Body.String())

		var std Standard
		AssertJSONBody(t, rr, &std)
		assert.NotEmpty(t, std.ID)
		assert.Equal(t, "Test Standard", std.Name)
		assert.Equal(t, "A test time standard", std.Description)
		assert.Equal(t, "25m", std.CourseType)
		assert.Equal(t, "female", std.Gender)
		assert.False(t, std.IsPreloaded)
	})

	t.Run("GET /standards lists standards", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create multiple standards
		standards := []StandardInput{
			{Name: "Standard 1", CourseType: "25m", Gender: "female"},
			{Name: "Standard 2", CourseType: "50m", Gender: "female"},
			{Name: "Standard 3", CourseType: "25m", Gender: "male"},
		}

		for _, s := range standards {
			rr := client.Post("/api/v1/standards", s)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/standards")

		assert.Equal(t, http.StatusOK, rr.Code)

		var list StandardList
		AssertJSONBody(t, rr, &list)
		assert.Len(t, list.Standards, 3)
	})

	t.Run("GET /standards filters by course_type", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		standards := []StandardInput{
			{Name: "25m Standard 1", CourseType: "25m", Gender: "female"},
			{Name: "50m Standard", CourseType: "50m", Gender: "female"},
			{Name: "25m Standard 2", CourseType: "25m", Gender: "female"},
		}

		for _, s := range standards {
			rr := client.Post("/api/v1/standards", s)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/standards?course_type=25m")

		assert.Equal(t, http.StatusOK, rr.Code)

		var list StandardList
		AssertJSONBody(t, rr, &list)
		assert.Len(t, list.Standards, 2)
		for _, s := range list.Standards {
			assert.Equal(t, "25m", s.CourseType)
		}
	})

	t.Run("GET /standards filters by gender", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		standards := []StandardInput{
			{Name: "Female Standard 1", CourseType: "25m", Gender: "female"},
			{Name: "Male Standard", CourseType: "25m", Gender: "male"},
			{Name: "Female Standard 2", CourseType: "25m", Gender: "female"},
		}

		for _, s := range standards {
			rr := client.Post("/api/v1/standards", s)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/standards?gender=female")

		assert.Equal(t, http.StatusOK, rr.Code)

		var list StandardList
		AssertJSONBody(t, rr, &list)
		assert.Len(t, list.Standards, 2)
		for _, s := range list.Standards {
			assert.Equal(t, "female", s.Gender)
		}
	})

	t.Run("GET /standards/{id} returns a standard with times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := StandardInput{
			Name:       "Test Standard",
			CourseType: "25m",
			Gender:     "female",
		}
		rr := client.Post("/api/v1/standards", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Standard
		AssertJSONBody(t, rr, &created)

		rr = client.Get("/api/v1/standards/" + created.ID)

		assert.Equal(t, http.StatusOK, rr.Code)

		var std StandardWithTimes
		AssertJSONBody(t, rr, &std)
		assert.Equal(t, created.ID, std.ID)
		assert.Equal(t, "Test Standard", std.Name)
		assert.Empty(t, std.Times) // No times yet
	})

	t.Run("GET /standards/{id} returns 404 for non-existent standard", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		rr := client.Get("/api/v1/standards/00000000-0000-0000-0000-000000000000")

		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("PUT /standards/{id} updates a standard", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create first
		input := StandardInput{
			Name:       "Original Name",
			CourseType: "25m",
			Gender:     "female",
		}
		rr := client.Post("/api/v1/standards", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Standard
		AssertJSONBody(t, rr, &created)

		// Update
		input.Name = "Updated Name"
		input.Description = "New description"
		rr = client.Put("/api/v1/standards/"+created.ID, input)

		assert.Equal(t, http.StatusOK, rr.Code)

		var updated Standard
		AssertJSONBody(t, rr, &updated)
		assert.Equal(t, created.ID, updated.ID)
		assert.Equal(t, "Updated Name", updated.Name)
		assert.Equal(t, "New description", updated.Description)
	})

	t.Run("DELETE /standards/{id} deletes a standard", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := StandardInput{
			Name:       "To Delete",
			CourseType: "25m",
			Gender:     "female",
		}
		rr := client.Post("/api/v1/standards", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Standard
		AssertJSONBody(t, rr, &created)

		rr = client.Delete("/api/v1/standards/" + created.ID)

		assert.Equal(t, http.StatusNoContent, rr.Code)

		// Verify deleted
		rr = client.Get("/api/v1/standards/" + created.ID)
		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("PUT /standards/{id}/times sets standard times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create standard
		input := StandardInput{
			Name:       "Test Standard",
			CourseType: "25m",
			Gender:     "female",
		}
		rr := client.Post("/api/v1/standards", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Standard
		AssertJSONBody(t, rr, &created)

		// Set times
		timesInput := struct {
			Times []StandardTimeInput `json:"times"`
		}{
			Times: []StandardTimeInput{
				{Event: "50FR", AgeGroup: "13-14", TimeMs: 28500},
				{Event: "100FR", AgeGroup: "13-14", TimeMs: 62000},
			},
		}
		rr = client.Put("/api/v1/standards/"+created.ID+"/times", timesInput)

		assert.Equal(t, http.StatusOK, rr.Code)

		var std StandardWithTimes
		AssertJSONBody(t, rr, &std)
		assert.Len(t, std.Times, 2)
		assert.Equal(t, "50FR", std.Times[0].Event)
		assert.Equal(t, 28500, std.Times[0].TimeMs)
		assert.Equal(t, "28.50", std.Times[0].TimeFormatted)
	})

	t.Run("POST /standards/import creates a standard with times", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := StandardImportInput{
			Name:        "Imported Standard",
			Description: "Imported from external source",
			CourseType:  "50m",
			Gender:      "female",
			Times: []StandardTimeInput{
				{Event: "50FR", AgeGroup: "13-14", TimeMs: 29000},
				{Event: "100FR", AgeGroup: "13-14", TimeMs: 63000},
				{Event: "50BK", AgeGroup: "13-14", TimeMs: 35000},
			},
		}

		rr := client.Post("/api/v1/standards/import", input)

		assert.Equal(t, http.StatusCreated, rr.Code, "expected 201, got %d: %s", rr.Code, rr.Body.String())

		var std StandardWithTimes
		AssertJSONBody(t, rr, &std)
		assert.NotEmpty(t, std.ID)
		assert.Equal(t, "Imported Standard", std.Name)
		assert.Equal(t, "50m", std.CourseType)
		assert.Equal(t, "female", std.Gender)
		assert.Len(t, std.Times, 3)
	})

	t.Run("POST /standards validates input", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		testCases := []struct {
			name  string
			input StandardInput
		}{
			{
				name:  "empty name",
				input: StandardInput{Name: "", CourseType: "25m", Gender: "female"},
			},
			{
				name:  "invalid course type",
				input: StandardInput{Name: "Test", CourseType: "100m", Gender: "female"},
			},
			{
				name:  "invalid gender",
				input: StandardInput{Name: "Test", CourseType: "25m", Gender: "other"},
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				rr := client.Post("/api/v1/standards", tc.input)
				assert.Equal(t, http.StatusBadRequest, rr.Code)
			})
		}
	})

	t.Run("view-only access cannot create standards", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		client.SetMockUser("view_only")
		defer client.SetMockUser("full")

		input := StandardInput{
			Name:       "Test Standard",
			CourseType: "25m",
			Gender:     "female",
		}

		rr := client.Post("/api/v1/standards", input)

		assert.Equal(t, http.StatusForbidden, rr.Code)
	})

	t.Run("duplicate standard name is rejected", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := StandardInput{
			Name:       "Unique Name",
			CourseType: "25m",
			Gender:     "female",
		}

		rr := client.Post("/api/v1/standards", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Try to create another with same name
		rr = client.Post("/api/v1/standards", input)
		assert.Equal(t, http.StatusBadRequest, rr.Code)
	})
}
