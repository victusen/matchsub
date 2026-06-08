import { watchedCountries } from "../config/constants.js";




const watchedCountriesLower = watchedCountries.map(c => c.toLowerCase());

export function filterMenFixtures(fixtures) {
  if (!fixtures || !Array.isArray(fixtures)) return [];
  
  return fixtures.filter(f => {
    const home = f.teams.home.name.toLowerCase();
    const away = f.teams.away.name.toLowerCase();

    return watchedCountriesLower.includes(home) || watchedCountriesLower.includes(away);
  });
}