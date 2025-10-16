import React from 'react';

export default function Header({ title = 'Upcoming', count }) {
  return (
    <header className="page-header">
      <h1>{title} {typeof count === 'number' && <span className="count">{count}</span>}</h1>
    </header>
  );
}
