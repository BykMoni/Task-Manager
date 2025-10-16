import React from 'react';
import Header from '../components/Header';

export default function Calendar() {
  return (
    <div className="dashboard">
      <Header title="Calendar" />
      <div className="grid">
        <div className="col-left">
          <div className="task-card">
            <h3>Calendar view (placeholder)</h3>
            <p style={{ marginTop: 12 }}>You can integrate a calendar library (e.g., FullCalendar) here later.</p>
          </div>
        </div>
        <div className="col-right">
          <div className="task-card">
            <h3>Upcoming events</h3>
            <p style={{ marginTop: 12 }}>No events yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
