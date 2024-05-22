const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Failed to connect to MongoDB:', err));

// Define User Schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

const resSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  table: {
    type: String,
    required: true
  },
  
})

const reviewSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  
})

// Create User model
const User = mongoose.model('User', userSchema);
const Res = mongoose.model('Res', resSchema);
const Review = mongoose.model('Review', reviewSchema);

// Route to get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, '-password'); // Exclude password field
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Route for user registration
app.post("/register", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const result = await newUser.save();
    res.status(201).json({ message: 'User registered successfully', user: result });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Failed to register user', error: error.message });
  }
});

// Route for user login (Authentication)
app.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ name: req.body.name });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password (you should use bcrypt.compare() for secure password comparison)
    if (user.password === req.body.password) {
      // Here you can generate JWT token and send it to client for further authenticated requests
      res.status(200).json({ message: 'Login successful', user: { name: user.name, email: user.email, id: user._id } });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.post("/res", async (req, res) => {
  try {
    const newRes = new Res(req.body);
    await newRes.save();
    res.status(201).json({ message: 'Res successfully' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Res not succesfull', error: error.message });
  }

});

app.get("/reservations", async (req, res) => {
  try {
    const reservations = await Res.find();
    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching reservations', error: error.message });
  }
});

app.post('/reviews', async (req, res) => {
  const { user_id, rating, content, date } = req.body;

  if (!user_id || !rating || !content || !date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const newReview = new Review({
      user_id,
      rating,
      content,
      date,
    });

    await newReview.save();

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Error saving review:', error);
    res.status(500).json({ error: 'An error occurred while saving the review.' });
  }
});

app.get('/reviewsList', async (req, res) => {
  try {
      const reviews = await Review.aggregate([
        {
          $lookup: {
            from: "users", // The name of the collection to join
            localField: "user_id", // The field in the review document
            foreignField: "_id", // The field in the user document
            as: "user" // The alias for the joined documents
          }
        },
        {
          $unwind: "$user" // Deconstructs the user array created by the lookup
        },
        {
          $project : {
            email : "$user.email",
            content: 1,
            date: 1,
            rating: 1
          }
        }
      ]);
    console.log(reviews);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'An error occurred while fetching the reviews.' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
