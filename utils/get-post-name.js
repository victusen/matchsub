const preferredName = {
  "Manchester United": "Man Utd",
  "Manchester City": "Man City",
  "Nottingham Forest": "Nottingham",
  "Brighton & Hove Albion": "Brighton",
  "AFC Bournemouth": "Bournemouth",
  "Ipswich Town": "Ipswich",
  "Leeds United": "Leeds",
  "Newcastle United": "Newcastle",
  "Tottenham Hotspur": "Tottenham",
  "West Ham United": "West Ham",
  "Hull City": "Hull",
  "Coventry City": "Coventry",
  "Atletico Madrid": "Atletico",
//   "Real Betis": "Betis",
  "Real Sociedad": "Sociedad",
  "Athletic Bilbao": "Bilbao",
  "Inter Milan": "Inter",
  "AC Milan": "Milan",
  "Bayern Munich": "Bayern",
  "Borussia Dortmund": "Dortmund",
  "RB Leipzig": "Leipzig",
  "Bayer Leverkusen": "Leverkusen",
  "Paris Saint Germain": "PSG",
  "AS Monaco": "Monaco",
  "RC Lens": "Lens",
  "United States": "USA"
};

export default function prefName(name) {
  // console.log(preferredName[name] || name);
  return preferredName[name] || name;
};

// prefName('Inter');