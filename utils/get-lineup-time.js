
// To convert kick-off time to lineup time in UTC
export default  function getLineupTime(kickOff) {
    const d = new Date(new Date(kickOff) - 60*60*1000);

    return d.toISOString();
};

// getLineupTime("2026-06-08T13:00:00+00:00"); 