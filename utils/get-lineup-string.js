// create the game lineup post
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const formatPlayerName = (p) => {
    const name = p.player.name;
    const parts = name.split(" ");
    return parts.length > 1 ? parts.slice(1).join(" ") : name;
};

export default function getLineup(arr) {
    const hT = arr[0];
    const aT = arr[1];
    
    const hL = formatXI(hT)
    const aL = formatXI(aT);
  
    console.log(hL);
    console.log(aL);
    
    const hSub = hT.substitutes.map(formatPlayerName).join(", ");
    const aSub = aT.substitutes.map(formatPlayerName).join(", ");
    console.log(hSub);
    console.log(aSub);

    return hT.team.name + " XI: " + hL + "\n\n" + aT.team.name + " XI: " + aL + "\n\n follow live on player of the match";
};

// const subsStr = "👕 Subs: " + hSub + "\n" + "👕 Subs: " + aSub;

function formatXI(team) {
  if (!team.formation) {
    return team.startXI.map(formatPlayerName).join(", ")}
  
  const formation = team.formation.split("-").map(Number);

  formation.unshift(1); // goalkeeper

  let index = 0;
  const rows = [];

  for (const count of formation) {
    const players = team.startXI
      .slice(index, index + count)
      .map(formatPlayerName)
      .join(", ");

    rows.push(players);

    index += count;
  }
  return rows.join("; ");
}