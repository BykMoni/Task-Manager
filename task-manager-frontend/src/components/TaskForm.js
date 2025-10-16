import React, { useState } from 'react';

export default function TaskForm({ onCreate = () => {}, placeholder = 'Add New Task' }) {
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCreate(text.trim());
    setText('');
  };

  return (
    <form className="task-form" onSubmit={submit}>
      <input
        className="task-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
      />
    </form>
  );
}
