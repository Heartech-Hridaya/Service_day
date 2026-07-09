const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, '../data/users.json');

const getUsers = () => JSON.parse(fs.readFileSync(dataPath, 'utf-8') || '[]');
const saveUsers = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.getAll = (req, res) => {
  res.json(getUsers());
};

exports.create = (req, res) => {
  const users = getUsers();
  const existing = users.find(u => u.username === req.body.username);
  if (existing) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const newUser = req.body; // Expects { username, name, role, password }
  users.push(newUser);
  saveUsers(users);
  res.status(201).json({ success: true });
};

exports.login = (req, res) => {
  const users = getUsers();
  const { username, password, role } = req.body;
  const user = users.find(u => u.username === username && u.password === password && u.role === role);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};
