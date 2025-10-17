// server/controllers/tasksController.js
const Task = require('../models/Task');
const mongoose = require('mongoose');

exports.list = async (req, res, next) => {
  try {
    // return tasks grouped by bucket for convenience
    const tasks = await Task.find().sort({ createdAt: -1 });
    const grouped = { today: [], tomorrow: [], week: [] };
    tasks.forEach(t => {
      const b = t.bucket || 'today';
      if (!grouped[b]) grouped[b] = [];
      grouped[b].push(t);
    });
    res.json(grouped);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { title, description = '', bucket = 'today' } = req.body;
    if (!title || typeof title !== 'string') return res.status(400).json({ message: 'Title is required' });
    const task = new Task({ title: title.trim(), description: description.trim(), bucket });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const updates = req.body;
    const task = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid id' });
    const task = await Task.findByIdAndDelete(id);
    if (!task) return res.status(404).json({ message: 'Not found' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
