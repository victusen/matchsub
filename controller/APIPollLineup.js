import axios from "axios"
import getLineup from "../utils/get-lineup-string.js";



export default async function postLineup(fixture) {
  try {
    const URL = `https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixture.fixtureId}`;
    const PARAMS = {
      headers: {
        "x-apisports-key": process.env.API_SPORT_KEY,
      }
    };
    const response = await axios.get(URL, PARAMS);
    
    const lineups = response.data.response;
    if (!lineups || lineups.length < 2) {
      console.log(fixture.homeTeam + " - " + fixture.awayTeam, "line ups are not ready.");
      return null;
    }
    
    console.log("Lineup for " + fixture.homeTeam + " - " + fixture.awayTeam + " confirmed ✅!");
    return getLineup(lineups);

  } catch (err) {
    console.log("Failed to fetch Lineup: " + err.message);
    return null;
  }
}