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
    
    const hL = hT.startXI.map(formatPlayerName).join(", ");
    const aL = aT.startXI.map(formatPlayerName).join(", ");
    console.log(hL);
    console.log(aL);
    
    const hSub = hT.substitutes.map(formatPlayerName).join(", ");
    const aSub = aT.substitutes.map(formatPlayerName).join(", ");
    console.log(hSub);
    console.log(aSub);

    const post = hT.team.name + " XI: " + hL + "\n\n" + aT.team.name + " XI: " + aL + "\n\n" + "👕 Subs: " + hSub + "\n" + "👕 Subs: " + aSub;
    console.log(post);
    return post;
};