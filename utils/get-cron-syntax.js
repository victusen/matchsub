
// For getting the cron syntax of time in utc
export default function getCron(utc) {
    const d = new Date(utc);
    console.log(d);
    const mins = d.getMinutes();
    const hr = d.getHours();
    const date = d.getDate();
    console.log(date);
    const month = d.getMonth() + 1;

    return `${mins} ${hr} ${date} ${month} *`
};

// getCron("2026-06-08T13:00:00+00:00");
