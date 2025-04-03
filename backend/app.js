const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/user.js');
const Community = require('./models/community.js');
const Notification = require('./models/notification.js');
const Schedule = require('./models/schedule');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const Report = require('./models/report.js');

const app = express();

// Connect to MongoDB
mongoose.connect("mongodb+srv://eujin:eujin2003@cluster0.wyo4w.mongodb.net/ecopulse?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.error('Connection failed:', error.message);
  });

app.use(bodyParser.json());

// CORS Middleware
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const token = uuidv4();
    user.token = token;
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      userId: user.userId,
      role: user.role,
      community: user.community,
      token
    });
  } catch (error) {
    console.error('Server error during login:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { email, username, password, community, contact, address } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(409).json({ message: 'Username or email already exists' });

    let role = 'Member';
    const userCount = await User.countDocuments();
    if (userCount === 0) role = 'super admin'; // First user is super admin

    const newUser = new User({
      email,
      username,
      password,
      role,
      community: community || 'none',
      contact: contact || '',
      address: address || '',
      token: uuidv4() // Initial token assignment
    });

    await newUser.save();

    res.status(201).json({
      message: 'Signup successful',
      userId: newUser.userId,
      role: newUser.role,
      token: newUser.token,
      community: newUser.community
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/communities', (req, res) => {
  console.log("Request body:", req.body);

  const { name, pickupSchedule } = req.body;

  if (!name || !pickupSchedule || pickupSchedule.length < 2) {
    console.log("Invalid data received");
    return res.status(400).json({ message: 'Invalid data, please check the fields.' });
  }

  const pickupDays = pickupSchedule.map(item => item.days);
  const pickupTimes = pickupSchedule.flatMap(item => item.times.map(t => t.time));

  console.log("pickupDays:", pickupDays);
  console.log("pickupTimes:", pickupTimes);

  const newCommunity = new Community({
    name,
    pickupSchedule,
  });

  newCommunity.save()
    .then((community) => {
      console.log("Community added:", community);
      res.status(201).json({
        message: 'Community added successfully',
        community,
      });
    })
    .catch((err) => {
      console.error("Error saving community:", err);
      res.status(500).json({ message: 'Failed to add community', error: err });
    });
});

// Fetch Communities Route
app.get('/api/communities', async (req, res) => {
  try {
    const communities = await Community.find();
    res.json(communities);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch User by ID Route
app.get('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile Route
app.put('/api/user/:id', async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log(updatedData);  // Check the content of the incoming request data

    // Update the user's fields
    user.username = updatedData.username || user.username;
    user.email = updatedData.email || user.email;
    user.contact = updatedData.contact || user.contact;
    user.community = updatedData.community || user.community;  // Should now be a string
    user.address = updatedData.address || user.address;
    user.role = updatedData.role || user.role;

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  const { message, role, community } = req.body;

  if (!message || !role) {
    return res.status(400).json({ error: 'Message and role are required' });
  }

  try {
    // If the role is 'super admin', send the notification to all users
    if (role === 'super admin') {
      const users = await User.find();
      for (const user of users) {
        const newNotification = new Notification({
          message,
          userId: user.userId,
          community: user.community,
        });
        await newNotification.save();
      }
      return res.status(200).json({ message: 'Notification sent to all users' });
    } 
    // If the role is 'community admin', send to users in the given community
    else if (role === 'community admin') {
      if (!community) {
        return res.status(400).json({ error: 'Community is required for community admins' });
      }
      const users = await User.find({ community });
      for (const user of users) {
        const newNotification = new Notification({
          message,
          userId: user.userId,  // Link notification to specific user
          community,
        });
        await newNotification.save();
      }
      return res.status(200).json({ message: `Notification sent to all users in the ${community} community` });
    } 
    // Unauthorized role
    else {
      return res.status(403).json({ error: 'Only super admin or community admin can broadcast notifications' });
    }
  } catch (error) {
    console.error('Error in sending notification:', error);
    return res.status(500).json({ error: 'Error sending notification' });
  }
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('User ID received:', userId);  // Log the user ID

    const user = await User.findOne({ userId: userId });  // Use userId to find the user
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).send('User not found');
    }

    let notifications;
    if (user.role === 'Member') {
      // If the user is a member, return notifications for their community
      notifications = await Notification.find({ userId: userId });
    } else {
      // Admins can see all notifications
      notifications = await Notification.find({});
    }

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/user/pickup-schedule/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    // Find the user by their ID
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If community is just a name string, use it directly
    const community = await Community.findOne({ name: user.community });
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    // Get the pickup schedule from the community
    const pickupSchedule = community.pickupSchedule;

    // Return the user's address, community pickup schedule, and user details
    res.status(200).json({
      address: user.address,
      communityName: community.name,
      pickupSchedule
    });

  } catch (error) {
    console.error('Error fetching pickup schedule or user details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.post('/api/pickup', async (req, res) => {
  const { selectedTime, selectedWaste, selectedRecyclables, pickupDate, userId } = req.body;

  if (!selectedTime || !selectedWaste || !pickupDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const address = user.address;

    if (selectedWaste === 'recyclable' && (!selectedRecyclables || selectedRecyclables.length === 0)) {
      return res.status(400).json({ message: 'Recyclables are required for recyclable waste' });
    }

    const newSchedule = new Schedule({
      userId: user.userId,
      selectedTime,
      selectedWaste,
      selectedRecyclables: selectedWaste === 'recyclable waste' ? selectedRecyclables : [],
      pickupDate,
      address,
    });

    await newSchedule.save();

    const notification = new Notification({
      userId: userId,
      community: user.community,
      message: `Your pickup schedule has been successfully created for ${pickupDate} at ${selectedTime}.`,
    });

    await notification.save();

    res.status(201).json({
      message: 'Pickup schedule created successfully',
      schedule: newSchedule,
    });
  } catch (error) {
    console.error('Error creating pickup schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/report/:id', upload.single('image'), async (req, res) => {
  const userId = req.params.id;
  console.log('Received userId:', userId);

  try {
    // Fetch the user by userId, which should be in UUID format
    const user = await User.findOne({ userId: userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { selectedIssue, issueLocation, issueDescription, additionalComments } = req.body;
    const image = req.file;

    if (!selectedIssue || !issueLocation || !issueDescription) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const newReport = new Report({
      userId,
      selectedIssue,
      issueLocation,
      issueDescription,
      additionalComments,
      imagePath: image ? image.path : null
    });

    await newReport.save();

    // Create a notification for the user using the original UUID userId
    const notification = new Notification({
      userId: userId, // Use the original UUID userId
      community: user.community,
      message: `Your report about ${selectedIssue} at ${issueLocation} has been successfully submitted.`,
    });

    await notification.save();

    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Fetch Pickup Statistics
app.get('/api/schedules/pickup-statistics', async (req, res) => {
  try {
    const { startDate, endDate, userId, userRole } = req.query;

    // Check if the dates are provided
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required.' });
    }

    // Convert startDate and endDate to Date objects, ignoring the time part
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Ensure the dates are valid
    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ message: 'Invalid date format.' });
    }

    // Normalize the dates to ignore time (set time to 00:00:00)
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999); // Set end date to the very end of the day

    // Log the dates in the format YYYY-MM-DD
    console.log('Normalized Start Date:', start.toISOString().split('T')[0]);
    console.log('Normalized End Date:', end.toISOString().split('T')[0]);

    // Build query based on the date range
    let query = {
      pickupDate: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
    };

    // Apply filtering based on user role
    if (userRole !== 'super admin' && userRole !== 'Admin') {
      query.userId = userId;
    }

    // Fetch the schedules based on the query
    const schedules = await Schedule.find(query);

    console.log('Schedules:', schedules); // Debugging the fetched schedules

    const pickupStats = {
      household: 0,
      recyclable: 0,
      hazardous: 0
    };

    // Process the fetched schedules and update statistics
    schedules.forEach(schedule => {
      console.log('Schedule:', schedule); // Debugging each schedule item

      // Normalize the pickupDate to ignore the time part
      const pickupDate = new Date(schedule.pickupDate);
      pickupDate.setHours(0, 0, 0, 0);  // Normalize time to midnight

      // Compare pickupDate with start and end dates, ensuring only the date is compared
      if (pickupDate >= start && pickupDate <= end) {
        if (schedule.selectedWaste === 'household waste') {
          pickupStats.household += 1;
        }
        if (schedule.selectedWaste === 'recyclable waste') {
          pickupStats.recyclable += 1;
        }
        if (schedule.selectedWaste === 'hazardous waste') {
          pickupStats.hazardous += 1;
        }
      }
    });

    console.log('Pickup Stats:', pickupStats); // Debugging the final statistics

    // Send the response with the pickup statistics
    res.json({
      labels: ['Household Waste', 'Recyclable Waste', 'Hazardous Waste'],
      values: [pickupStats.household, pickupStats.recyclable, pickupStats.hazardous]
    });
  } catch (error) {
    console.error('Error fetching pickup statistics:', error);
    res.status(500).json({ message: 'Error fetching pickup statistics', error });
  }
});

// Fetch Issues Reported
app.get('/api/reports/issues-reported', async (req, res) => {
  try {
    const { startDate, endDate, userId, userRole } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let query = {
      createdAt: { $gte: start, $lte: end }
    };

    // Apply filtering based on user role
    if (userRole !== 'super admin' && userRole !== 'Admin') {
      query.userId = userId;
    }

    const reports = await Report.find(query);

    const issueStats = {
      missedPickup: 0,
      overflowingBin: 0,
      illegalDumping: 0
    };

    reports.forEach(report => {
      if (report.selectedIssue === 'missed pickup') {
        issueStats.missedPickup += 1;
      }
      if (report.selectedIssue === 'overflowing bin') {
        issueStats.overflowingBin += 1;
      }
      if (report.selectedIssue === 'illegal dumping') {
        issueStats.illegalDumping += 1;
      }
    });

    res.json({
      labels: ['Missed Pickup', 'Overflowing Bin', 'Illegal Dumping'],
      values: [issueStats.missedPickup, issueStats.overflowingBin, issueStats.illegalDumping]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issues reported', error });
  }
});

// Fetch Recycling Rates
app.get('/api/schedules/recycling-rates', async (req, res) => {
  try {
    const { startDate, endDate, userId, userRole } = req.query;

    const start = new Date(startDate);
    const end = new Date(endDate);

    let query = {
      pickupDate: { $gte: start.toISOString().split('T')[0], $lte: end.toISOString().split('T')[0] }
    };

    // Apply filtering based on user role
    if (userRole !== 'super admin' && userRole !== 'Admin') {
      query.userId = userId;
    }

    const schedules = await Schedule.find(query);

    const recyclingRates = {
      plastic: 0,
      paper: 0,
      aluminium: 0
    };

    schedules.forEach(schedule => {
      if (schedule.selectedRecyclables.includes('plastic')) {
        recyclingRates.plastic += 1;
      }
      if (schedule.selectedRecyclables.includes('paper')) {
        recyclingRates.paper += 1;
      }
      if (schedule.selectedRecyclables.includes('aluminium')) {
        recyclingRates.aluminium += 1;
      }
    });

    res.json({
      labels: ['Plastic', 'Paper', 'Aluminium'],
      values: [recyclingRates.plastic, recyclingRates.paper, recyclingRates.aluminium]
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recycling rates', error });
  }
});

app.get('/api/schedules/pickups', async (req, res) => {
  try {
    const { startDate, endDate, wasteType, userId } = req.query;

    // Ensure that userId is provided
    if (!userId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    // Build the query to match filters and the userId
    const query = { userId };

    if (startDate && endDate) {
      query.pickupDate = { $gte: new Date(startDate).toISOString().split('T')[0], $lte: new Date(endDate).toISOString().split('T')[0] };
    }

    if (wasteType && wasteType !== 'All') {
      query.selectedWaste = wasteType;
    }

    if (wasteType && wasteType === 'Household') {
      query.selectedWaste = 'household waste';
    }

    if (wasteType && wasteType === 'Recyclable') {
      query.selectedWaste = 'recyclable waste';
    }

    if (wasteType && wasteType === 'Hazardous') {
      query.selectedWaste = 'hazardous waste';
    }

    // Fetch the data from the database for the logged-in user
    const schedules = await Schedule.find(query);

    // Return the schedules
    res.json(schedules);
  } catch (error) {
    console.error('Error fetching pickup schedules:', error);
    res.status(500).json({ message: 'Error fetching schedules', error });
  }
});

module.exports = app;
