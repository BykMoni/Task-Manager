import React from 'react';
import Header from '../components/Header';

export default function Lists() {
  return (
    <div className="dashboard">
      <Header title="Lists" />
      <div className="grid">
        <div className="col-left">
          <div className="task-card">
            <h3>Your Lists</h3>
            <p style={{ marginTop: 12 }}>Manage saved lists here. (This is a placeholder — we can add create/edit/delete lists next.)</p>
          </div>
        </div>
        <div className="col-right">
          <div className="task-card">
            <h3>List preview</h3>
            <p style={{ marginTop: 12 }}>Select a list to preview tasks.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
