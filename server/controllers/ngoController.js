const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/ngos.json');

const getNgos = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const saveNgos = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.getAll = (req, res) => {
  res.json(getNgos());
};

exports.getById = (req, res) => {
  const ngos = getNgos();
  const ngo = ngos.find(n => n.id === parseInt(req.params.id));
  if (ngo) res.json(ngo);
  else res.status(404).json({ message: 'NGO not found' });
};

exports.create = (req, res) => {
  const ngos = getNgos();
  const newId = ngos.length > 0 ? Math.max(...ngos.map(n => n.id)) + 1 : 1;
  const newNgo = { ...req.body, id: newId };
  ngos.push(newNgo);
  saveNgos(ngos);
  res.status(201).json(newNgo);
};

exports.update = (req, res) => {
  const ngos = getNgos();
  const index = ngos.findIndex(n => n.id === parseInt(req.params.id));
  if (index !== -1) {
    ngos[index] = { ...ngos[index], ...req.body, id: parseInt(req.params.id) };
    saveNgos(ngos);
    res.json(ngos[index]);
  } else {
    res.status(404).json({ message: 'NGO not found' });
  }
};

exports.delete = (req, res) => {
  let ngos = getNgos();
  ngos = ngos.filter(n => n.id !== parseInt(req.params.id));
  saveNgos(ngos);
  res.status(204).send();
};
