import { watchedClubs, watchedCountries } from "../config/constants.js";

const watchedCountriesLower = watchedCountries.map(c => c.toLowerCase());
const watchedClubsLower = watchedClubs.map(c => c.toLowerCase());


export function filterWatchedTeamsInEvent(fixture) {
  const home = fixture.homeTeam.toLowerCase();
  const away = fixture.awayTeam.toLowerCase();

  const homeMatched = watchedClubsLower.includes(home) || watchedCountriesLower.includes(home);
  const awayMatched = watchedClubsLower.includes(away) || watchedCountriesLower.includes(away);

  if (homeMatched && awayMatched) {
      return "both";
  } else if (homeMatched) {
      return "home";
  } else if (awayMatched) {
      return "away";
  }

  return null;   // nothing matched
}
