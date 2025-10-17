const Task = require('../models/Task');
const mongoose = require('mongoose');

const parseOptionalDate = (value) => {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
};

exports.list = async (req, res, next) => {
  try {
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
    const { title, description = '', bucket = 'today', startDate, expectedCompletion } = req.body;
    if (!title || typeof title !== 'string') return res.status(400).json({ message: 'Title is required' });

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      bucket,
      startDate: parseOptionalDate(startDate),
      expectedCompletion: parseOptionalDate(expectedCompletion)
    });

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

    const updates = { ...req.body };
    // parse date strings if present
    if (updates.startDate !== undefined) updates.startDate = parseOptionalDate(updates.startDate);
    if (updates.expectedCompletion !== undefined) updates.expectedCompletion = parseOptionalDate(updates.expectedCompletion);

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
