import prefName from "./get-post-name.js";

// const team =  {
//   fixtureId: 1544812,
//   homeTeam: 'Netherlands',
//   awayTeam: 'Uzbekistan',
//   kickOffTime: '2026-06-08T18:45:00+00:00',
//   lineUpTime: '2026-06-08T17:45:00.000Z'
// }

export default function getKickoffString(f) {
  // console.log(`🚩 Kick off: ${prefName(f.homeTeam)} 0-0 ${prefName(f.awayTeam)} `);
  return `🚩 Kick off: ${prefName(f.homeTeam)} 0-0 ${prefName(f.awayTeam)} `
}; 

// getKickoffString(team);