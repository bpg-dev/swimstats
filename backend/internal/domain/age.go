package domain

import "time"

// AgeAtCompetition calculates swimmer's age using Swimming Canada rules:
// Age as of December 31 of the competition year.
func AgeAtCompetition(birthDate, meetDate time.Time) int {
	competitionYear := meetDate.Year()
	dec31 := time.Date(competitionYear, 12, 31, 0, 0, 0, 0, time.UTC)

	age := dec31.Year() - birthDate.Year()

	// Adjust if birthday hasn't occurred by Dec 31 of competition year
	birthMonth := birthDate.Month()
	birthDay := birthDate.Day()
	if birthMonth > 12 || (birthMonth == 12 && birthDay > 31) {
		age--
	}

	return age
}

// AgeGroupFromAge determines the age group from a swimmer's age.
func AgeGroupFromAge(age int) AgeGroup {
	switch {
	case age <= 10:
		return AgeGroup10U
	case age <= 12:
		return AgeGroup11_12
	case age <= 14:
		return AgeGroup13_14
	case age <= 17:
		return AgeGroup15_17
	default:
		return AgeGroupOpen
	}
}

// AgeGroupAtCompetition combines both calculations.
func AgeGroupAtCompetition(birthDate, meetDate time.Time) AgeGroup {
	age := AgeAtCompetition(birthDate, meetDate)
	return AgeGroupFromAge(age)
}

// CurrentAgeGroup returns the age group for the current season.
func CurrentAgeGroup(birthDate time.Time) AgeGroup {
	return AgeGroupAtCompetition(birthDate, time.Now())
}

// AgeGroupBounds returns the min and max ages for an age group.
func AgeGroupBounds(ag AgeGroup) (min, max int) {
	switch ag {
	case AgeGroup10U:
		return 0, 10
	case AgeGroup11_12:
		return 11, 12
	case AgeGroup13_14:
		return 13, 14
	case AgeGroup15_17:
		return 15, 17
	case AgeGroupOpen:
		return 18, 99
	default:
		return 0, 0
	}
}
