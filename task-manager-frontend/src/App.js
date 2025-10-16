import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Today from './pages/Today';
import Calendar from './pages/Calendar';
import StickyWall from './pages/StickyWall';
import Lists from './pages/Lists';
import Settings from './pages/Settings';

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-area">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/sticky" element={<StickyWall />} />
          <Route path="/lists" element={<Lists />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}
