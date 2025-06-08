const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Funksion për regjistrim
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Funksion për login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Nuk ekziston llogaria' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Fjalëkalimi i gabuar' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Gabim në server' });
  }
};

// Funksioni për rikuperimin e fjalëkalimit (Forgot Password)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Përdoruesi nuk ekziston' });

    // Krijoni një token të sigurt për rikuperimin
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Ruajeni tokenin në databazë (përmes fushave të reja që i shtuam më parë)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 3600000; // Tokeni skadon pas 1 ore
    await user.save();

    // Dërgojini email për rikuperim
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Vendosni email-in tuaj
        pass: 'your-email-password',  // Vendosni fjalëkalimin tuaj
      },
    });

    const resetUrl = `http://localhost:5000/reset-password/${resetToken}`;

    await transporter.sendMail({
      to: email,
      subject: 'Rikuperimi i Fjalëkalimit',
      text: `Për të rikuperuar fjalëkalimin tuaj, klikoni në këtë link: ${resetUrl}`,
    });

    res.status(200).json({ message: 'Email-i për rikuperim është dërguar!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim në server' });
  }
};

// Funksioni për ndryshimin e fjalëkalimit (Reset Password)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Kontrolloni nëse tokeni është i vlefshëm
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: 'Tokeni është skaduar ose i pavlefshëm' });
    }

    // Krijoni fjalëkalimin e ri dhe ruajeni atë
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Fjalëkalimi është ndryshuar me sukses!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gabim në server' });
  }
};
