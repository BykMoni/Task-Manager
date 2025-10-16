import React from 'react';
import Header from '../components/Header';

export default function StickyWall() {
  return (
    <div className="dashboard">
      <Header title="Sticky Wall" />
      <div className="grid">
        <div className="col-left">
          <div className="task-card">
            <h3>Sticky Wall</h3>
            <p style={{ marginTop: 12 }}>
              This is a placeholder for sticky notes / quick reminders. Later we can add drag-and-drop cards here.
            </p>

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{
                minWidth: 160, minHeight: 120, padding: 12, borderRadius: 10,
                background: '#fff9d6', border: '1px solid rgba(15,23,36,0.04)'
              }}>
                <strong>Buy supplies</strong>
                <p style={{ marginTop: 8, color: '#6b7280' }}>Pens, printer ink, sticky notes</p>
              </div>

              <div style={{
                minWidth: 160, minHeight: 120, padding: 12, borderRadius: 10,
                background: '#e6f7ff', border: '1px solid rgba(15,23,36,0.04)'
              }}>
                <strong>Call designer</strong>
                <p style={{ marginTop: 8, color: '#6b7280' }}>Confirm hero image sizes</p>
              </div>

              <div style={{
                minWidth: 160, minHeight: 120, padding: 12, borderRadius: 10,
                background: '#ffdede', border: '1px solid rgba(15,23,36,0.04)'
              }}>
                <strong>Meeting notes</strong>
                <p style={{ marginTop: 8, color: '#6b7280' }}>Send minutes to the team</p>
              </div>
            </div>
          </div>
        </div>

        <div className="col-right">
          <div className="task-card">
            <h3>Notes</h3>
            <p style={{ marginTop: 12 }}>Add quick thoughts here. We can add create/edit for sticky notes later.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
