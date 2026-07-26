import axios from "axios";
import dotenv from "dotenv"

dotenv.config()

export async function fetchTodayFixtures() {
    const today = new Date().toISOString().split("T")[0];
    console.log("Today is " + today);
    
    const URL = `https://v3.football.api-sports.io//fixtures/events?fixture=1542339`;

    const PARAMS = {
        headers : {
            "x-apisports-key": process.env.API_SPORT_KEY,
        }
    };

    try {
        const response = await axios.get(URL, PARAMS);
        const fixtures = response.data.response;
        console.log(response.data.errors);
        
        console.log(JSON.stringify(fixtures, null, 2));
        return fixtures;
    } catch (err) {
        console.log(err);
        return [];
    }
};

fetchTodayFixtures();

/* const subs = [
{
"fixture": {
  "id": 1542339,
  "referee": null,
  "timezone": "UTC",
  "date": "2026-07-24T16:00:00+00:00",
  "timestamp": 1784908800,
  "periods": {
  "first": 1784908800,
  "second": 1784912400
},
"venue": {
"id": null,
"name": "Lerkendal Stadion",
"city": "Trondheim"
},
"status": {
"long": "Match Finished",
"short": "FT",
"elapsed": 90,
"extra": 4
}
},
"league": {
  "id": 667,
  "name": "Friendlies Clubs",
  "country": "World",
  "logo": "https://media.api-sports.io/football/leagues/667.png",
  "flag": null,
  "season": 2026,
  "round": "Club Friendlies",
  "standings": false
},
"goals": {
…
},
"score": {
  "halftime": {
    "home": 0,
    "away": 1
  },
  "fulltime": {
    "home": 0,
    "away": 5
  },
  "extratime": {
    "home": null,
    "away": null
  },
  "penalty": {
    "home": null,
    "away": null
  }
},
"events": [
{
"time": {
  "elapsed": 31,
  "extra": null
},
"team": {
  "id": 33,
  "name": "Manchester United",
  "logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
  "id": 557462,
  "name": "S. Lacey"
},
"assist": {
"id": null,
"name": null
},
"type": "Goal",
"detail": "Normal Goal",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 2935,
"name": "H. Maguire"
},
"assist": {
"id": 402330,
"name": "J. Kamason"
},
"type": "subst",
"detail": "Substitution 1",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 891,
"name": "L. Shaw"
},
"assist": {
"id": 403064,
"name": "H. Amass"
},
"type": "subst",
"detail": "Substitution 2",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 393073,
"name": "A. Chiakha"
},
"assist": {
"id": 61234,
"name": "D. Duris"
},
"type": "subst",
"detail": "Substitution 1",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 339941,
"name": "N. Sahsah"
},
"assist": {
"id": 577338,
"name": "M. Soboczynski"
},
"type": "subst",
"detail": "Substitution 2",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 25378,
"name": "I. Fossum"
},
"assist": {
"id": 266378,
"name": "A. Borgersen"
},
"type": "subst",
"detail": "Substitution 3",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 12880,
"name": "O. Selnaes"
},
"assist": {
"id": 498765,
"name": "E. Slordal"
},
"type": "subst",
"detail": "Substitution 4",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 427607,
"name": "M. Bomholt"
},
"assist": {
"id": 162262,
"name": "J. Bakke"
},
"type": "subst",
"detail": "Substitution 5",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 39134,
"name": "A. Pereira"
},
"assist": {
"id": 319150,
"name": "H. Rosten"
},
"type": "subst",
"detail": "Substitution 6",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 341059,
"name": "J. Reitan-Sunde"
},
"assist": {
"id": 1189,
"name": "E. K. Ceide"
},
"type": "subst",
"detail": "Substitution 7",
"comments": null
},
{
"time": {
"elapsed": 46,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 205137,
"name": "T. Nemcik"
},
"assist": {
"id": 332457,
"name": "T. Dahl"
},
"type": "subst",
"detail": "Substitution 8",
"comments": null
},
{
"time": {
"elapsed": 56,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 70100,
"name": "J. Zirkzee"
},
"assist": {
"id": null,
"name": null
},
"type": "Goal",
"detail": "Normal Goal",
"comments": null
},
{
"time": {
"elapsed": 60,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 15822,
"name": "J. Mortensen"
},
"assist": {
"id": 48040,
"name": "A. F. Witry"
},
"type": "subst",
"detail": "Substitution 9",
"comments": null
},
{
"time": {
"elapsed": 60,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 416077,
"name": "H. Volden"
},
"assist": {
"id": 264384,
"name": "M. K. Ceide"
},
"type": "subst",
"detail": "Substitution 10",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 19220,
"name": "M. Mount"
},
"assist": {
"id": 408896,
"name": "J. Devaney"
},
"type": "subst",
"detail": "Substitution 3",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 70100,
"name": "J. Zirkzee"
},
"assist": {
"id": 389309,
"name": "C. Obi"
},
"type": "subst",
"detail": "Substitution 4",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 305834,
"name": "Andrey Santos"
},
"assist": {
"id": 284400,
"name": "T. Collyer"
},
"type": "subst",
"detail": "Substitution 5",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 20589,
"name": "B. Mbeumo"
},
"assist": {
"id": 365664,
"name": "E. Williams"
},
"type": "subst",
"detail": "Substitution 6",
"comments": null
},
{
    "time": {
      "elapsed": 61,
      "extra": null
    },
    "team": {
      "id": 33,
      "name": "Manchester United",
      "logo": "https://media.api-sports.io/football/teams/33.png"
    },
    "player": {
      "id": 382452,
      "name": "P. Dorgu"
    },
    "assist": {
      "id": 303010,
      "name": "D. Gore"
    },
    "type": "subst",
    "detail": "Substitution 7",
    "comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 402329,
"name": "A. Heaven"
},
"assist": {
"id": 383770,
"name": "J. Fletcher"
},
"type": "subst",
"detail": "Substitution 8",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 557462,
"name": "S. Lacey"
},
"assist": {
"id": 557460,
"name": "T. Fletcher"
},
"type": "subst",
"detail": "Substitution 9",
"comments": null
},
{
"time": {
"elapsed": 61,
"extra": null
},
"team": {
  "id": 33,
  "name": "Manchester United",
  "logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
  "id": 342970,
  "name": "L. Yoro"
},
"assist": {
  "id": 546704,
  "name": "D. Armer"
},
"type": "subst",
  "detail": "Substitution 10",
  "comments": null
},
{
"time": {
  "elapsed": 63,
  "extra": null
},
"team": {
  "id": 33,
  "name": "Manchester United",
  "logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
  "id": 408896,
  "name": "J. Devaney"
},
"assist": {
  "id": null,
  "name": null
},
"type": "Goal",
"detail": "Normal Goal",
"comments": null
},
{
"time": {
"elapsed": 72,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 403064,
"name": "H. Amass"
},
"assist": {
"id": null,
"name": null
},
"type": "Goal",
"detail": "Normal Goal",
"comments": null
},
{
"time": {
"elapsed": 72,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 284361,
"name": "R. Vitek"
},
"assist": {
"id": 284382,
"name": "D. Mee"
},
"type": "subst",
"detail": "Substitution 11",
"comments": null
},
{
"time": {
"elapsed": 73,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 162262,
"name": "J. Bakke"
},
"assist": {
"id": 612850,
"name": "B. Hedman"
},
"type": "subst",
"detail": "Substitution 11",
"comments": null
},
{
"time": {
"elapsed": 84,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 365664,
"name": "E. Williams"
},
"assist": {
"id": null,
"name": null
},
"type": "Goal",
"detail": "Normal Goal",
"comments": null
},
{
"time": {
"elapsed": 88,
"extra": null
},
"team": {
"id": 331,
"name": "Rosenborg",
"logo": "https://media.api-sports.io/football/teams/331.png"
},
"player": {
"id": 266378,
"name": "A. Borgersen"
},
"assist": {
"id": 570206,
"name": "U. Hald-Hernes"
},
"type": "subst",
"detail": "Substitution 12",
"comments": null
},
{
"time": {
"elapsed": 88,
"extra": null
},
"team": {
"id": 33,
"name": "Manchester United",
"logo": "https://media.api-sports.io/football/teams/33.png"
},
"player": {
"id": 408896,
"name": "J. Devaney"
},
"assist": {
"id": null,
"name": null
},
"type": "Card",
"detail": "Yellow Card",
"comments": null
}
],
"lineups": [],
"statistics": [],
"players": []
}
]
*/

const today = new Date().toISOString().split("T")[0];
console.log("Today is " + today);
    
const URL = `https://v3.football.api-sports.io//fixtures/events?fixture=1542339`;

const PARAMS = {
  headers : {
    "x-apisports-key": process.env.API_SPORT_KEY,
  }
};

try {
  const response = await axios.get(URL, PARAMS);
  const events = response.data.response;
} catch (err) {
  console.log(err);
}


/* function getSubsPostString(teamEvents, fixture) {
  if (!teamEvents.length > 0) return null;
  const subMin = Number(teamEvents[0]?.time?.elapsed);
  let nextSubMin = subMin+2;

  const subGroup = [];
  teamEvents.forEach(sub => {
    if (sub.time.elapsed === subMin || sub.time.elapsed === subMin+1) {
      console.log("Group-sub incoming.")
      subGroup.push(sub)
    }
    if (sub.time.elapsed > nextSubMin) {
      // to create postsz even its for another grouped set(array)
    }
      // else if (sub.time.elapse > subMin+1)
  })
  
  // const postTitle = `🚩 Live: ${prefName(fixture.homeTeam)} - ${prefName(fixture.awayTeam)}`
  // const postFooter = `📲 Follow your favourite teams on @Player_Of_The_Match`
    
  const subs = getSubString(subGroup);
  
  return `🚩 Live: ${prefName(fixture.homeTeam)} - ${prefName(fixture.awayTeam)}\n\n${subs}\n\n📲 Follow your favourite teams on @Player_Of_The_Match`
} */