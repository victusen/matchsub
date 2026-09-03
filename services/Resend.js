import dotenv from "dotenv"
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function sendNotFinishedAlert(fixture, result, matchStatus) {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev>",
      to: "usenvictor40@gmail.com",
      subject: `MatchSub: ${fixture.homeTeam} vs ${fixture.awayTeam} not FT after 11 polls`,
      text: `Fixture ${fixture.homeTeam} vs ${fixture.awayTeam} hit poll 11 but status is "${matchStatus}", not FT.\n\nCurrent score: ${result.homeScore}-${result.awayScore}\nScorers: ${result.goalscorers}\n\nFixture ID: ${fixture.fixtureId}`,
    });
  } catch (err) {
    console.error("Failed to send not-finished alert email:", err.message);
  }
}


// sendNotFinishedAlert(fixture, result, matchStatus) 