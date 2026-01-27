package integration

import (
	"context"
	"net/http"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type SwimmerInput struct {
	Name      string `json:"name"`
	BirthDate string `json:"birth_date"`
	Gender    string `json:"gender"`
}

type SwimmerInputWithThreshold struct {
	Name             string   `json:"name"`
	BirthDate        string   `json:"birth_date"`
	Gender           string   `json:"gender"`
	ThresholdPercent *float64 `json:"threshold_percent,omitempty"`
}

type Swimmer struct {
	ID              string `json:"id"`
	Name            string `json:"name"`
	BirthDate       string `json:"birth_date"`
	Gender          string `json:"gender"`
	CurrentAge      int    `json:"current_age,omitempty"`
	CurrentAgeGroup string `json:"current_age_group,omitempty"`
}

func TestSwimmerAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("PUT /swimmer creates swimmer profile", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := SwimmerInput{
			Name:      "Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}

		rr := client.Put("/api/v1/swimmer", input)

		// First creation should return 201
		assert.Equal(t, http.StatusCreated, rr.Code, "expected 201 Created, got %d: %s", rr.Code, rr.Body.String())

		var swimmer Swimmer
		AssertJSONBody(t, rr, &swimmer)
		assert.NotEmpty(t, swimmer.ID)
		assert.Equal(t, "Test Swimmer", swimmer.Name)
		assert.Equal(t, "2012-05-15", swimmer.BirthDate)
		assert.Equal(t, "female", swimmer.Gender)
	})

	t.Run("PUT /swimmer updates existing swimmer", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create first
		input := SwimmerInput{
			Name:      "Original Name",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Update
		input.Name = "Updated Name"
		input.Gender = "male"
		rr = client.Put("/api/v1/swimmer", input)

		assert.Equal(t, http.StatusOK, rr.Code, "expected 200 OK for update")

		var swimmer Swimmer
		AssertJSONBody(t, rr, &swimmer)
		assert.Equal(t, "Updated Name", swimmer.Name)
		assert.Equal(t, "male", swimmer.Gender)
	})

	t.Run("GET /swimmer returns swimmer profile", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create swimmer first
		input := SwimmerInput{
			Name:      "Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}
		rr := client.Put("/api/v1/swimmer", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		// Get swimmer
		rr = client.Get("/api/v1/swimmer")

		assert.Equal(t, http.StatusOK, rr.Code)

		var swimmer Swimmer
		AssertJSONBody(t, rr, &swimmer)
		assert.Equal(t, "Test Swimmer", swimmer.Name)
		// Should have computed age fields
		assert.Greater(t, swimmer.CurrentAge, 0)
		assert.NotEmpty(t, swimmer.CurrentAgeGroup)
	})

	t.Run("GET /swimmer returns 404 when no swimmer exists", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		rr := client.Get("/api/v1/swimmer")

		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("PUT /swimmer validates input", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		testCases := []struct {
			name  string
			input SwimmerInput
		}{
			{
				name: "empty name",
				input: SwimmerInput{
					Name:      "",
					BirthDate: "2012-05-15",
					Gender:    "female",
				},
			},
			{
				name: "invalid gender",
				input: SwimmerInput{
					Name:      "Test",
					BirthDate: "2012-05-15",
					Gender:    "invalid",
				},
			},
			{
				name: "invalid date",
				input: SwimmerInput{
					Name:      "Test",
					BirthDate: "not-a-date",
					Gender:    "female",
				},
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				rr := client.Put("/api/v1/swimmer", tc.input)
				assert.Equal(t, http.StatusBadRequest, rr.Code)
			})
		}
	})

	t.Run("view-only access cannot modify swimmer", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		client.SetMockUser("view_only")
		defer client.SetMockUser("full")

		input := SwimmerInput{
			Name:      "Test Swimmer",
			BirthDate: "2012-05-15",
			Gender:    "female",
		}

		rr := client.Put("/api/v1/swimmer", input)

		assert.Equal(t, http.StatusForbidden, rr.Code)
	})
}

func TestSwimmerAgeCalculation(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	testCases := []struct {
		name             string
		birthDate        string
		expectedAgeGroup string
	}{
		{
			name:             "10 & Under",
			birthDate:        time.Now().AddDate(-10, 0, 0).Format("2006-01-02"),
			expectedAgeGroup: "10U",
		},
		{
			name:             "11-12",
			birthDate:        time.Now().AddDate(-12, 0, 0).Format("2006-01-02"),
			expectedAgeGroup: "11-12",
		},
		{
			name:             "13-14",
			birthDate:        time.Now().AddDate(-14, 0, 0).Format("2006-01-02"),
			expectedAgeGroup: "13-14",
		},
		{
			name:             "15-17",
			birthDate:        time.Now().AddDate(-16, 0, 0).Format("2006-01-02"),
			expectedAgeGroup: "15-17",
		},
		{
			name:             "Open",
			birthDate:        time.Now().AddDate(-20, 0, 0).Format("2006-01-02"),
			expectedAgeGroup: "OPEN",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			testDB.ClearTables(ctx, t)

			input := SwimmerInput{
				Name:      "Test Swimmer",
				BirthDate: tc.birthDate,
				Gender:    "female",
			}
			rr := client.Put("/api/v1/swimmer", input)
			require.Equal(t, http.StatusCreated, rr.Code)

			rr = client.Get("/api/v1/swimmer")
			require.Equal(t, http.StatusOK, rr.Code)

			var swimmer Swimmer
			AssertJSONBody(t, rr, &swimmer)
			assert.Equal(t, tc.expectedAgeGroup, swimmer.CurrentAgeGroup)
		})
	}
}
