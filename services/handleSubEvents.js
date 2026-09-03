import cron from "node-cron"
import axios from "axios"
import sendNotFinishedAlert from "./Resend.js"
import { jobs } from "../job.js"
import { supabase } from "../services/supabase.js"
import { liveFixtures } from "./scheduleFixtures.js"
import { filterWatchedTeamsInEvent } from "../controller/filterMenFixture.js";
import getCurrentScore from "../utils/get-current-score.js"
import getLastSubProcessed from "../utils/get-last-sub.js" 
import updateLastSubProcessed from "../utils/update-last-sub.js"
import getSubPostString from "../utils/get-sub-post-string.js";

// Short time resolve before next poll 
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const pollNum = {};

// export default async function pollSubEvents() {
  cron.schedule("*/10 * * * *", async () => {
    if (liveFixtures.length === 0) { return };
  
    for (const fixture of liveFixtures) {
      try {
        // check to know if finished
        if (Date.now() >= (new Date(fixture.kickOffTime).getTime() + (2 * 60 * 60 * 1000))) {
          console.log(fixture.homeTeam + " - " + fixture.awayTeam + " should be ended. Pulling");
          const index = liveFixtures.findIndex(f => f.fixtureId === fixture.fixtureId);
    
          if (index !== -1) { liveFixtures.splice(index,1) };
          
          console.log("Removed from live fixtures.");
          continue;
        }
  
        console.log(fixture.homeTeam + " - " + fixture.awayTeam + ", still live.")

        if (!pollNum[fixture.fixtureId]) {
          pollNum[fixture.fixtureId] = { loopNum: 0 };
        }

        let events = [];
    
        const watched = filterWatchedTeamsInEvent(fixture);
        if (!watched) { continue };
        
        try {
          const URL = `https://v3.football.api-sports.io/fixtures/events?fixture=${fixture.fixtureId}`;
          const PARAMS = {
            headers: {
              "x-apisports-key": process.env.API_SPORT_KEY,
            }
          };
          
          const res = await axios.get(URL, PARAMS); 
          events = res.data.response;
          console.log(`${fixture.homeTeam} - ${fixture.awayTeam}: ${events.length} event`);
          
          if (!events.length) { continue };
        } catch (err) {
          const status = err.response?.status;
          const retryAfter = err.response?.headers?.["retry-after"];
        
          if (status === 429) {
            console.warn(
              `[API 429] ${fixture.homeTeam} - ${fixture.awayTeam} events request rate limited. ` +
              `Retry after ${retryAfter ?? "unknown"}s.`
            );
          } else {
            console.error(
              `[API ERROR] ${fixture.homeTeam} - ${fixture.awayTeam} ` +
              `| Status: ${status ?? "unknown"} | ${err.message}`
            );
          }
        
          continue;
        }

        if (pollNum[fixture.fixtureId].loopNum >= 11) {
          const result = getCurrentScore(events, fixture, 90);
          const { ftPost } = result
          const matchStatus = fixture.status?.short ?? events[0]?.fixture?.status?.short;

          if (matchStatus !== "FT") {
            await sendNotFinishedAlert(fixture, result, matchStatus);
          }
          jobs.push(ftPost)
        } else {
          pollNum[fixture.fixtureId].loopNum++
        }
          
        const homeSubEvent = (watched === "home" || watched === "both") ? events.filter(event => 
      event.type === "subst" && event.team.name === fixture.homeTeam) : [];
        const awaySubEvent = (watched === "away" || watched === "both") ? events.filter(event => 
      event.type === "subst" && event.team.name === fixture.awayTeam) : [];
    
        const { home, away } = await getLastSubProcessed(fixture.fixtureId); 
    
        const newHomeSubEvent = homeSubEvent.slice(home);
        const newAwaySubEvent = awaySubEvent.slice(away); 
    
        const hPost = getSubPostString(newHomeSubEvent, events, fixture, fixture.homeTeam)
        const aPost = getSubPostString(newAwaySubEvent, events, fixture, fixture.awayTeam)
    
        for (const post of hPost) {
          jobs.push(post)
        }
        for (const post of aPost) {
          jobs.push(post)
        }
    
        if (newHomeSubEvent.length || newAwaySubEvent.length) {
          await updateLastSubProcessed(fixture.fixtureId, {
            home: home+newHomeSubEvent.length, 
            away: away+newAwaySubEvent.length
          })
        }

        // Wait 30sec before polling next liveFixture
        await sleep(21000);
        // Now go over to next loop
        
      } catch (err) {
       console.log(`Failed processing fixture ${fixture.fixtureId}:`, err.message);
       continue;
      }
    };
  });
// }
