

// For changing to wat time ~ at last minute before posting 
function getWAT(utc) {
    const d = new Date(utc);
    return d.toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false 
    });
    
};

// getWAT("2026-06-08T13:00:00+00:00");