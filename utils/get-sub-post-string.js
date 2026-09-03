import getCurrentScore from "./get-current-score.js"
import getSubGroupString from "./get-sub-group-string.js"
import reformPostName from "./reform-post-name.js"
import prefName from "./get-post-name.js"


export default function getSubPostString(teamEvents, events, fixture, teamName) {
  
  if (!teamEvents.length) {
    console.log(`${teamName} in \(${fixture.homeTeam} - ${fixture.awayTeam}\), no new event. Skipping.`);
    return [];
  }

  const posts = [];

  // To sort the events in order of time occurred
  teamEvents.sort((a,b)=> {
    return a.time.elapsed-b.time.elapsed
  });

  let i = 0;

  while (i < teamEvents.length) {

      const startMinute = teamEvents[i].time.elapsed;

      const { homeScore, awayScore } = getCurrentScore(events, fixture, startMinute);

      const group = [];

      while (
          i < teamEvents.length &&
          teamEvents[i].time.elapsed <= startMinute + 1
      ) {
          group.push(teamEvents[i]);
          i++;
      }

      const subs = getSubGroupString(group);

      const homeName =
    teamName === fixture.homeTeam
        ? `[ ${prefName(fixture.homeTeam)} ]`
        : reformPostName(prefName(fixture.homeTeam));

      const awayName =
    teamName === fixture.awayTeam
        ? `[ ${prefName(fixture.awayTeam)} ]`
        : reformPostName(prefName(fixture.awayTeam));

      posts.push(
`🚩 Sub: ${homeName} ${homeScore}-${awayScore} ${awayName}

${subs}

📱 Follow Player of the Match`
      );
  }

  return posts;
};