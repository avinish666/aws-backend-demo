const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient, ObjectId } = require("mongodb");
const dotenv = require("dotenv");

dotenv.config();

const uri = process.env.MONGODB_URI;

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("MongoDB client connected!");
  }
}

// ==================== SIGNUP ====================

async function signup(req, res) {
  const { username, password, email } = req.body;

  try {
    if (!username || !password || !email) {
      return res.status(400).json({
        message: "Username, email and password are required!",
      });
    }

    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Username or email already exists!",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    // MongoDB uses insertedId, NOT insertId
    const userId = result.insertedId;

    const token = jwt.sign(
      { id: userId.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "Signup successful!",
      token,
      userId,
    });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).send("Server error");
  }
}

// ==================== LOGIN ====================

async function login(req, res) {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required!",
      });
    }

    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials!",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful!",
      token,
      userId: user._id,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).send("Server error!");
  }
}

// ==================== GET ALL USERS ====================

async function getAllUsers(req, res) {
  try {
    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();

    res.json(users);
  } catch (err) {
    console.error("Error during fetching users:", err);
    res.status(500).send("Server error!");
  }
}

// ==================== GET USER PROFILE ====================

async function getUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    if (!ObjectId.isValid(currentID)) {
      return res.status(400).json({
        message: "Invalid user ID!",
      });
    }

    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.json(user);
  } catch (err) {
    console.error("Error during fetching profile:", err);
    res.status(500).send("Server error!");
  }
}

// ==================== UPDATE USER PROFILE ====================

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password } = req.body;

  try {
    if (!ObjectId.isValid(currentID)) {
      return res.status(400).json({
        message: "Invalid user ID!",
      });
    }

    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const updateFields = {};

    if (email) {
      updateFields.email = email;
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.password = await bcrypt.hash(password, salt);
    }

    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentID),
      },
      {
        $set: updateFields,
      },
      {
        returnDocument: "after",
      }
    );

    if (!result) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.json(result);
  } catch (err) {
    console.error("Error during updating profile:", err);
    res.status(500).send("Server error!");
  }
}

// ==================== DELETE USER ====================

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    if (!ObjectId.isValid(currentID)) {
      return res.status(400).json({
        message: "Invalid user ID!",
      });
    }

    await connectClient();

    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "User not found!",
      });
    }

    res.json({
      message: "User Profile Deleted!",
    });
  } catch (err) {
    console.error("Error during deleting user:", err);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};