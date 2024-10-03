// app/calendar/page.js

'use client';
import { useState } from 'react';

export default function CalendarPage() {
  const [filterId, setFilterId] = useState('');
  const [calendarUrl, setCalendarUrl] = useState('');

  const generateUrl = () => {
    setCalendarUrl(`/api/calendar?filterId=${filterId}`);
  };

  return (
    <div>
      <h1>Generiraj svoj urnik</h1>
      <input
        type="text"
        placeholder="Vnesi svoj filterId"
        value={filterId}
        onChange={(e) => setFilterId(e.target.value)}
      />
      <button onClick={generateUrl}>Generiraj URL</button>

      {calendarUrl && (
        <div>
          <h2>Generated URL:</h2>
          <a href={calendarUrl}>{calendarUrl}</a>
        </div>
      )}
    </div>
  );
}
