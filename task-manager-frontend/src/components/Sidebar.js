import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTasks } from '../contexts/TasksContext';

export default function Sidebar() {
  const { counts } = useTasks();

  const activeClass = ({ isActive }) => isActive ? 'nav-item active' : 'nav-item';

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        <div className="menu-title">
          <h3>Menu</h3>
          <button className="hamburger">≡</button>
        </div>

        <div className="search">
          <input placeholder="Search" />
        </div>

        <div className="section">
          <h4 className="section-title">TASKS</h4>
          <ul className="nav-list">
            <li><NavLink to="/" className={activeClass}>Upcoming <span className="badge">{counts.total}</span></NavLink></li>
            <li><NavLink to="/today" className={activeClass}>Today <span className="muted-badge">{counts.today}</span></NavLink></li>
            <li><NavLink to="/calendar" className={activeClass}>Calendar</NavLink></li>
            <li><NavLink to="/sticky" className={activeClass}>Sticky Wall</NavLink></li>
          </ul>
        </div>

        <div className="section">
          <h4 className="section-title">LISTS</h4>
          <ul className="lists">
            <li className="list-item"><span className="dot dot-pink" /> Personal <span className="muted-badge">3</span></li>
            <li className="list-item"><span className="dot dot-blue" /> Work <span className="muted-badge">6</span></li>
            <li className="list-item"><span className="dot dot-yellow" /> List 1 <span className="muted-badge">3</span></li>
            <li className="add-list">+ Add New List</li>
          </ul>
        </div>

        <div className="section tags">
          <h4 className="section-title">TAGS</h4>
          <div className="tag-row">
            <button className="tag">Tag 1</button>
            <button className="tag tag-outline">Tag 2</button>
            <button className="tag add">+ Add Tag</button>
          </div>
        </div>

        <div className="sidebar-bottom">
          <div className="sb-item"><NavLink to="/settings" className={({isActive})=> isActive ? 'nav-item active' : ''}>⚙️ Settings</NavLink></div>
          <div className="sb-item">Sign out</div>
        </div>
      </div>
    </aside>
  );
}
