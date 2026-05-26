export function downloadICS() {
  const event = {
    title: "Founder-Being: Full Moon Gathering (Dubai)",
    description: "Theme: Manifesting & Letting Go. A limited intimate founder circle focused on deep conversations, reflection, calmness, and conscious leadership.",
    location: "DUBAI . MIDDLE EAST . INDIA . SOUTH EAST ASIA",
    startDate: "20260530T170000", // 30 May 2026 at 17:00 (5:00 PM)
    endDate: "20260530T210000",   // 30 May 2026 at 21:00 (9:00 PM)
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//FounderBeing//NONSGML Event//EN",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@founderbeing.com`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART:${event.startDate}`,
    `DTEND:${event.endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "founder-being-gathering-may30.ics");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
