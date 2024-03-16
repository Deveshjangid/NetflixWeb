require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { uploadImages } = require('./imageUploader');


const { User } = require('./models/user');
const { UserProfile } = require('./models/UserProfiles');

const userProfileRoutes = require('./routes/userProfileRoutes');
  
const app = express(); 
const PORT = process.env.PORT || 8005;

app.use('/user-profile', userProfileRoutes);
app.use(bodyParser.json());
app.use(cors()); 

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 // Add this line to handle MongoDB duplicate key errors
}); 

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
}); 

const transporter = nodemailer.createTransport({    
  service: 'Gmail',
  auth: { 
    user: process.env.EMAIL_USERNAME,
    pass: process.env.YOUR_APP_PASSWORD, // Corrected the password field name
  },
});

const otpData = {};

uploadImages();


// Function to send OTP via email
const sendEmailOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email OTP sent successfully to:', email);
  } catch (error) {
    console.error('Error sending email OTP:', error);
    throw error;
  }
};

// Create a new user profile
app.post('/create-user-profile', async (req, res) => {
  try {
    const { name, imageUrl, userId } = req.body;
    
    // Check if the 'name' and 'imageUrl' fields are provided
    if (!name || !imageUrl) {
      return res.status(400).json({ error: 'Name and imageUrl are required' });
    }

    // Create a new user profile
    const newProfile = new UserProfile({
      name,
      image: imageUrl,
      userId,
      // You can add other profile fields here as needed
    });

    await newProfile.save();

    // Link the profile to the user if 'userId' is provided
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.userProfile = newProfile;
      await user.save();
    }

    res.status(201).json({ message: 'User profile created successfully' });
  } catch (error) {
    console.error('Profile creation failed:', error);
    res.status(500).json({ error: 'Profile creation failed' });
  }
});
   

// Fetch user profiles associated with a user
app.get('/user-profiles', async (req, res) => {
  try {
    const { email, password, userId } = req.query;

    // Fetch the user profile based on email and password
    const userProfile = await UserProfile.findOne({ email, password, userId });
    if (!userProfile || userProfile.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.status(200).json(userProfile);

  } catch (error) {     
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user profiles' });
  }
});

// Registration endpoint
app.post('/register', async (req, res) => { 
  try {
    const { email, name, phoneNumber, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const commonOTP = generateOTP();
    otpData[email] = commonOTP;

    await sendEmailOTP(email, commonOTP);

    const newUser = new User({
      email,
      name,
      phoneNumber,
      password,
      userProfile: null,
    });

    await newUser.save();

    // Create an empty user profile for the user
    const newProfile = new UserProfile({
      name: name, 
    });

    await newProfile.save();

    // Link the profile to the user
    newUser.userProfile = newProfile;
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Verify OTP endpoint
app.post('/verify-otp', (req, res) => {
  const { otp } = req.body;
  const email = req.body.email;
  // Assuming you have authentication middleware

  if (otp === otpData[email]) {
    res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    res.status(400).json({ error: 'Invalid OTP' });
  }
});

// Resend OTP endpoint
app.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const newOTP = generateOTP();

    if (!email) { 
      return res.status(400).json({ error: 'Email address is required' });
    }

    await sendEmailOTP(email, newOTP);
    otpData[email] = newOTP;

    res.status(200).json({ message: 'OTP resent successfully' });
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ error: 'OTP resend failed' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Perform user authentication with MongoDB here
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Authentication successful
    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});




// Function to generate a random 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
