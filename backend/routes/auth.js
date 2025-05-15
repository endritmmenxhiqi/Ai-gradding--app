const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/user');

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'Email ekziston' });

    user = new User({ firstName, lastName, email, password, role });
    await user.save();
    res.status(201).json({ msg: 'Përdoruesi u regjistrua me sukses' });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Kredenciale të gabuara' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Kredenciale të gabuara' });

    // Shto rolin në përgjigje
    res.json({ 
      msg: 'Hyrje e suksesshme', 
      token: 'simulated-jwt-token',
      role: user.role // <--- Ndryshimi kritik këtu
    });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'Email nuk ekziston' });

    console.log(`Reset link: http://localhost:3000/reset?token=simulated-token`);
    res.json({ msg: 'Linku u dërgua me sukses (shiko konsolën)' });

  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;