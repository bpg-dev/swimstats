package integration

import (
	"context"
	"fmt"
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type MeetInput struct {
	Name       string `json:"name"`
	City       string `json:"city"`
	Country    string `json:"country,omitempty"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date,omitempty"`
	CourseType string `json:"course_type"`
}

type Meet struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	City       string `json:"city"`
	Country    string `json:"country"`
	StartDate  string `json:"start_date"`
	EndDate    string `json:"end_date"`
	CourseType string `json:"course_type"`
	TimeCount  int    `json:"time_count,omitempty"`
}

type MeetList struct {
	Meets []Meet `json:"meets"`
	Total int    `json:"total"`
}

func TestMeetAPI(t *testing.T) {
	if testing.Short() {
		t.Skip("skipping integration test in short mode")
	}

	ctx := context.Background()
	testDB := SetupTestDB(ctx, t)
	defer testDB.TeardownTestDB(ctx, t)

	handler := setupTestHandler(t, testDB)
	client := NewAPIClient(t, handler)
	client.SetMockUser("full")

	t.Run("POST /meets creates a meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := MeetInput{
			Name:       "Ontario Championships",
			City:       "Toronto",
			Country:    "Canada",
			StartDate:       "2026-03-15",
			CourseType: "25m",
		}

		rr := client.Post("/api/v1/meets", input)
		
		assert.Equal(t, http.StatusCreated, rr.Code, "expected 201, got %d: %s", rr.Code, rr.Body.String())

		var meet Meet
		AssertJSONBody(t, rr, &meet)
		assert.NotEmpty(t, meet.ID)
		assert.Equal(t, "Ontario Championships", meet.Name)
		assert.Equal(t, "Toronto", meet.City)
		assert.Equal(t, "Canada", meet.Country)
		assert.Equal(t, "2026-03-15", meet.StartDate)
		assert.Equal(t, "25m", meet.CourseType)
	})

	t.Run("POST /meets defaults country to Canada", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := MeetInput{
			Name:       "Local Meet",
			City:       "Ottawa",
			StartDate:       "2026-02-10",
			CourseType: "50m",
		}

		rr := client.Post("/api/v1/meets", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var meet Meet
		AssertJSONBody(t, rr, &meet)
		assert.Equal(t, "Canada", meet.Country)
	})

	t.Run("GET /meets lists meets", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create multiple meets
		meets := []MeetInput{
			{Name: "Meet 1", City: "Toronto", StartDate: "2026-01-10", CourseType: "25m"},
			{Name: "Meet 2", City: "Ottawa", StartDate: "2026-02-15", CourseType: "50m"},
			{Name: "Meet 3", City: "Montreal", StartDate: "2026-03-20", CourseType: "25m"},
		}

		for _, m := range meets {
			rr := client.Post("/api/v1/meets", m)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/meets")
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var list MeetList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 3, list.Total)
		assert.Len(t, list.Meets, 3)
		// Should be ordered by date DESC
		assert.Equal(t, "Meet 3", list.Meets[0].Name)
	})

	t.Run("GET /meets filters by course_type", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		meets := []MeetInput{
			{Name: "25m Meet 1", City: "Toronto", StartDate: "2026-01-10", CourseType: "25m"},
			{Name: "50m Meet", City: "Ottawa", StartDate: "2026-02-15", CourseType: "50m"},
			{Name: "25m Meet 2", City: "Montreal", StartDate: "2026-03-20", CourseType: "25m"},
		}

		for _, m := range meets {
			rr := client.Post("/api/v1/meets", m)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/meets?course_type=25m")
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var list MeetList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 2, list.Total)
		for _, m := range list.Meets {
			assert.Equal(t, "25m", m.CourseType)
		}
	})

	t.Run("GET /meets/{id} returns a specific meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := MeetInput{
			Name:       "Specific Meet",
			City:       "Vancouver",
			StartDate:       "2026-04-01",
			CourseType: "50m",
		}
		rr := client.Post("/api/v1/meets", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Meet
		AssertJSONBody(t, rr, &created)

		rr = client.Get("/api/v1/meets/" + created.ID)
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var meet Meet
		AssertJSONBody(t, rr, &meet)
		assert.Equal(t, created.ID, meet.ID)
		assert.Equal(t, "Specific Meet", meet.Name)
	})

	t.Run("GET /meets/{id} returns 404 for non-existent meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		rr := client.Get("/api/v1/meets/00000000-0000-0000-0000-000000000000")
		
		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("PUT /meets/{id} updates a meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create first
		input := MeetInput{
			Name:       "Original Name",
			City:       "Toronto",
			StartDate:       "2026-01-10",
			CourseType: "25m",
		}
		rr := client.Post("/api/v1/meets", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Meet
		AssertJSONBody(t, rr, &created)

		// Update
		input.Name = "Updated Name"
		input.City = "Ottawa"
		rr = client.Put("/api/v1/meets/"+created.ID, input)
		
		assert.Equal(t, http.StatusOK, rr.Code)

		var updated Meet
		AssertJSONBody(t, rr, &updated)
		assert.Equal(t, created.ID, updated.ID)
		assert.Equal(t, "Updated Name", updated.Name)
		assert.Equal(t, "Ottawa", updated.City)
	})

	t.Run("DELETE /meets/{id} deletes a meet", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		input := MeetInput{
			Name:       "To Delete",
			City:       "Toronto",
			StartDate:       "2026-01-10",
			CourseType: "25m",
		}
		rr := client.Post("/api/v1/meets", input)
		require.Equal(t, http.StatusCreated, rr.Code)

		var created Meet
		AssertJSONBody(t, rr, &created)

		rr = client.Delete("/api/v1/meets/" + created.ID)
		
		assert.Equal(t, http.StatusNoContent, rr.Code)

		// Verify deleted
		rr = client.Get("/api/v1/meets/" + created.ID)
		assert.Equal(t, http.StatusNotFound, rr.Code)
	})

	t.Run("POST /meets validates input", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		testCases := []struct {
			name  string
			input MeetInput
		}{
			{
				name:  "empty name",
				input: MeetInput{Name: "", City: "Toronto", StartDate: "2026-01-10", CourseType: "25m"},
			},
			{
				name:  "empty city",
				input: MeetInput{Name: "Meet", City: "", StartDate: "2026-01-10", CourseType: "25m"},
			},
			{
				name:  "invalid course type",
				input: MeetInput{Name: "Meet", City: "Toronto", StartDate: "2026-01-10", CourseType: "100m"},
			},
			{
				name:  "invalid date",
				input: MeetInput{Name: "Meet", City: "Toronto", StartDate: "not-a-date", CourseType: "25m"},
			},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				rr := client.Post("/api/v1/meets", tc.input)
				assert.Equal(t, http.StatusBadRequest, rr.Code)
			})
		}
	})

	t.Run("view-only access cannot create meets", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		client.SetMockUser("view_only")
		defer client.SetMockUser("full")

		input := MeetInput{
			Name:       "Test Meet",
			City:       "Toronto",
			StartDate:       "2026-01-10",
			CourseType: "25m",
		}

		rr := client.Post("/api/v1/meets", input)
		
		assert.Equal(t, http.StatusForbidden, rr.Code)
	})

	t.Run("GET /meets supports pagination", func(t *testing.T) {
		testDB.ClearTables(ctx, t)

		// Create 5 meets
		dates := []string{"2026-01-10", "2026-01-11", "2026-01-12", "2026-01-13", "2026-01-14"}
		for i, date := range dates {
			input := MeetInput{
				Name:       fmt.Sprintf("Meet %d", i+1),
				City:       "Toronto",
				StartDate:       date,
				CourseType: "25m",
			}
			rr := client.Post("/api/v1/meets", input)
			require.Equal(t, http.StatusCreated, rr.Code)
		}

		rr := client.Get("/api/v1/meets?limit=2&offset=0")
		
		var list MeetList
		AssertJSONBody(t, rr, &list)
		assert.Equal(t, 5, list.Total)
		assert.Len(t, list.Meets, 2)

		rr = client.Get("/api/v1/meets?limit=2&offset=2")
		AssertJSONBody(t, rr, &list)
		assert.Len(t, list.Meets, 2)
	})
}
