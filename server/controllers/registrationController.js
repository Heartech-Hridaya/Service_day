const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/registrations.json');

const getRegistrations = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]');
const saveRegistrations = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.getAll = (req, res) => {
  res.json(getRegistrations());
};

exports.getById = (req, res) => {
  const regs = getRegistrations();
  const reg = regs.find(r => r.id === parseInt(req.params.id));
  if (reg) res.json(reg);
  else res.status(404).json({ message: 'Registration not found' });
};

exports.create = (req, res) => {
  const regs = getRegistrations();
  const newId = regs.length > 0 ? Math.max(...regs.map(r => r.id)) + 1 : 1;
  const newReg = { ...req.body, id: newId, registrationTime: req.body.registrationTime || new Date().toISOString() };
  regs.push(newReg);
  saveRegistrations(regs);
  res.status(201).json(newReg);
};

exports.update = (req, res) => {
  const regs = getRegistrations();
  const index = regs.findIndex(r => r.id === parseInt(req.params.id));
  if (index !== -1) {
    regs[index] = { ...regs[index], ...req.body, id: parseInt(req.params.id) };
    saveRegistrations(regs);
    res.json(regs[index]);
  } else {
    res.status(404).json({ message: 'Registration not found' });
  }
};

exports.delete = (req, res) => {
  let regs = getRegistrations();
  regs = regs.filter(r => r.id !== parseInt(req.params.id));
  saveRegistrations(regs);
  res.status(204).send();
};
