// server.js (Backend)
const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const io = require("socket.io")(9009, {
  cors: {
    origin: 'http://localhost:5173', // Update to your frontend URL
  }
});

// Connect DB
require("./db/connection");

// Import Files
const Users = require("./models/Users");
const Conversations = require("./models/Conversations");
const Messages = require("./models/Messages");

// App use
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

let users = [];
io.on("connection", (socket) => {
  console.log("User connected ", socket.id);

  // Add user to the users array
  socket.on('addUser', (userId) => {
    const isUserExists = users.find(user => user.userId == userId);
    if (!isUserExists) {
      const user = { userId, socketId: socket.id };
      users.push(user);
      io.emit('getUsers', users);
    }
  });

  // Listen to sendMessage event from the client
  socket.on('sendMessage', ({ senderId, receiverId, message, conversationId }) => {
    const receiver = users.find(user => user.userId === receiverId);
    const sender = users.find(user => user.userId === senderId);
    if (receiver) {
      io.to(receiver.socketId).to(sender.socketId).emit('getMessage', {
        senderId, message, conversationId, receiverId
      });
    }
  });

  // Remove user from the users list when they disconnect
  socket.on('disconnect', () => {
    users = users.filter(user => user.socketId !== socket.id);
    io.emit('getUsers', users);
  });
});

// Routes and other endpoints
app.get("/", (req, res) => {
  res.send("Welcome");
});

// Register route
app.post("/api/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName || !email || !password) {
    return res.status(400).send("Please fill all the required fields");
  }
  const isAlreadyExist = await Users.findOne({ email });
  if (isAlreadyExist) {
    return res.status(400).send("Email already exists");
  }

  const newUser = new Users({ fullName, email });
  bcryptjs.hash(password, 10, (err, hashedPassword) => {
    newUser.set("password", hashedPassword);
    newUser.save();
  });
  res.status(200).send("New user created successfully");
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please fill all the required fields");
  }
  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(404).send("User not found");
  }
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Invalid email or password");
  }

  const payload = {
    userId: user._id,
    email: user.email,
  };
  const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";
  jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: 86400 }, async (err, token) => {
    await Users.updateOne({ _id: user._id }, { $set: { token } });
    user.save();
  });

  res.status(200).json({ user: { id: user._id, email: user.email, fullName: user.fullName }, token: user.token });
});

// Create conversation
app.post("/api/conversation", async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    const newConversation = new Conversations({
      members: [senderId, receiverId],
    });
    await newConversation.save();
    res.status(200).send("Conversation created successfully");
  } catch (error) {
    console.log("Error: " + error);
  }
});

// Get all conversations for a user
app.get("/api/conversations/:userId", async (req, res) => {
  const userId = req.params.userId;
  const conversations = await Conversations.find({ members: { $in: [userId] } });
  const conversationUserData = await Promise.all(
    conversations.map(async (conversation) => {
      const receiverId = conversation.members.find(member => member !== userId);
      const user = await Users.findById(receiverId);
      return { user: { receiverId: user._id, email: user.email, fullName: user.fullName }, conversationId: conversation._id };
    })
  );
  res.status(200).json(conversationUserData);
});

// Send message
app.post("/api/message", async (req, res) => {
  const { conversationId, senderId, message, receiverId = "" } = req.body;
  if (!senderId || !message) return res.status(400).send("Please fill all the required fields");
  if (conversationId === 'new' && receiverId) {
    const newConversation = new Conversations({ members: [senderId, receiverId] });
    await newConversation.save();
    const newMessage = new Messages({ conversationId: newConversation._id, senderId, message });
    await newMessage.save();
    return res.status(200).send("Message sent successfully");
  } else if (!conversationId && !receiverId) {
    return res.status(400).send("Please fill all the required fields");
  }
  const newMessage = new Messages({ conversationId, senderId, message });
  await newMessage.save();
  res.status(200).send("Message sent successfully");
});

// Get all messages in a conversation
app.get("/api/message/:conversationId", async (req, res) => {
  const conversationId = req.params.conversationId;
  const { senderId, receiverId } = req.query;

  // If the conversation is new
  if (conversationId === "new") {
    const checkConversation = await Conversations.find({ members: { $all: [senderId, receiverId] } });
    return res.status(200).json(checkConversation.length > 0 ? [] : []);
  }

  // Fetch the conversation and its messages
  const conversation = await Conversations.findById(conversationId);
  if (!conversation) return res.status(404).json({ error: "Conversation not found" });

  const { members } = conversation;
  const messages = await Messages.find({ conversationId });
  const messageReceiverData = await Promise.all(
    messages.map(async (message) => {
      const receiverId = members.find(id => id !== message.senderId);
      const receiver = await Users.findById(receiverId);
      return { sender: { id: message.senderId, message: message.message }, receiver: { id: receiver._id, fullName: receiver.fullName, email: receiver.email } };
    })
  );

  res.status(200).json(messageReceiverData);
});

// Get all users except the current user
app.get("/api/users/:userId", async (req, res) => {
  const userId = req.params.userId;
  const users = await Users.find({ _id: { $ne: userId } }); // $ne: not equal to 
  const usersData = await Promise.all(
    users.map(async (user) => {
      return { user: { email: user.email, fullName: user.fullName, receiverId: user._id } };
    })
  );
  res.status(200).json(usersData);
});

// Start the server
app.listen(port, () => {
  console.log("Server is running on port " + port);
});
