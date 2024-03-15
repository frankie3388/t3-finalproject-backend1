const { User } = require('../models/UserModel');

const checkUniqueEmailAndUsername = async (req, res, next) => {
  const { email } = req.body;
  const { username } = req.body;

  try {
    // Check if the email already exists in the database
    const existingEmail = await User.findOne({ email });
    // Check if the username already exists in the database
    const existingUsername = await User.findOne({ username });

    if (existingEmail && existingUsername) {
      return res.status(400).json({ error: 'Email and username already exist' });
    } else if (existingEmail) {
      return res.status(400).json({ error: 'Email already exists' });
    } else if (existingUsername) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // If the email and username is unique, move to the next middleware or route handler
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error' });
  }
};

module.exports = checkUniqueEmailAndUsername;
