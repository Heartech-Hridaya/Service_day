const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/notifications.json');

const getNotifications = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]');
const saveNotifications = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.getAll = (req, res) => {
  res.json(getNotifications());
};

exports.getById = (req, res) => {
  const notes = getNotifications();
  const note = notes.find(n => n.id === parseInt(req.params.id));
  if (note) res.json(note);
  else res.status(404).json({ message: 'Notification not found' });
};

exports.create = (req, res) => {
  const notes = getNotifications();
  const newId = notes.length > 0 ? Math.max(...notes.map(n => n.id)) + 1 : 1;
  const newNote = { ...req.body, id: newId, timestamp: req.body.timestamp || new Date().toISOString() };
  notes.push(newNote);
  saveNotifications(notes);
  res.status(201).json(newNote);
};

exports.update = (req, res) => {
  const notes = getNotifications();
  const index = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (index !== -1) {
    notes[index] = { ...notes[index], ...req.body, id: parseInt(req.params.id) };
    saveNotifications(notes);
    res.json(notes[index]);
  } else {
    res.status(404).json({ message: 'Notification not found' });
  }
};

exports.delete = (req, res) => {
  let notes = getNotifications();
  notes = notes.filter(n => n.id !== parseInt(req.params.id));
  saveNotifications(notes);
  res.status(204).send();
};
