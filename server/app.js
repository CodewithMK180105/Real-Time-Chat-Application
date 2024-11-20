const express = require("express");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Connect DB
require("./db/connection");

// Import Files
const Users = require("./models/Users");
const Conversations = require("./models/Conversations");
const Messages = require("./models/Messages");

// App use
const app = express();
app.use(express.json()); // every response that is sent by the client gets parsed in the json format.
app.use(express.urlencoded({ extended: false }));
app.use(cors());

const port = process.env.PORT || 8000;

// Routes
app.get("/", (req, res) => {
  res.send("Welcome");
});

app.post("/api/register", async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).send("Please fill all the required fields");
    } else {
      const isAlreadyExist = await Users.findOne({ email });
      if (isAlreadyExist) {
        res.status(400).send("Email already exists");
      } else {
        const newUser = new Users({ fullName, email });
        bcryptjs.hash(password, 10, (err, hashedPassword) => {
          newUser.set("password", hashedPassword);
          newUser.save();
          next();
        });
        return res.status(200).send("new User ganerated successfully");
      }
    }
  } catch (error) {}
});

app.post("/api/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send("Please fill all the require fields");
    } else {
      const user = await Users.findOne({ email });
      if (!user) {
        res.status(404).send("User not found");
      } else {
        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
          res.status(400).send("User email or password is incorrect");
        } else {
          const payload = {
            userId: user._id,
            email: user.email,
          };
          const JWT_SECRET_KEY =
            process.env.JWT_SECRET_KEY || "THIS_IS_A_JWT_SECRET_KEY";
          jwt.sign(
            payload,
            JWT_SECRET_KEY,
            { expiresIn: 86400 },
            async (err, token) => {
              await Users.updateOne(
                { _id: user._id },
                {
                  $set: { token },
                }
              );
              user.save();
              next();
            }
          );
          res
            .status(200)
            .json({
              user: {
                id: user._id,
                email: user.email,
                fullName: user.fullName,
              },
              token: user.token,
            });
        }
      }
    }
  } catch (error) {}
});

app.post("/api/conversation", async (req, res) => { // Creates the conversation
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

app.get("/api/conversations/:userId", async (req, res) => { // Gives conversationId, and data of user chatting with us.
  try {
    const userId = req.params.userId;
    const conversations = await Conversations.find({
      members: { $in: [userId] },
    });
    console.log(conversations.length);
    const conversationUserData = Promise.all(
      conversations.map(async (conversation) => {
        const receiverId =conversation.members.find(
          (member) => member !== userId
        );
        const user = await Users.findById(receiverId);
        return {
          user: {
            receiverId: user._id,
            email: user.email,
            fullName: user.fullName,
          },
          conversationId: conversation._id,
        };
      })
    );
    console.log("Backend "+conversations);
    res.status(200).json(await conversationUserData);
  } catch (error) {
    console.log("Error " + error);
  }
});

app.post("/api/message", async (req, res) => {
  try {
    const { conversationId, senderId, message, receiverId = "" } = req.body;
    console.log(conversationId,senderId,message,receiverId);
    if (!senderId || !message)
      return res.status(400).send("Please fill all the required fields");
    if (conversationId==='new' && receiverId) {
      const newConversation = new Conversations({
        members: [senderId, receiverId],
      });
      await newConversation.save();
      const newMessage = new Messages({
        conversationId: newConversation._id,
        senderId: senderId,
        message: message,
      });
      await newMessage.save();
      return res.status(200).send("Message sent successfully");
    } else if (!conversationId && !receiverId) {
      return res.status(400).send("Please fill all the required fields");
    }
    const newMessage = new Messages({ conversationId, senderId, message });
    await newMessage.save();
    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.log("Error " + error);
  }
});

// app.get("/api/message/:conversationId", async (req, res) => {
//   try {
//     const conversationId = req.params.conversationId;
//     console.log("conv" + conversationId);

//     // Return an empty array if the conversation is new
//     if (conversationId === 'new'){
//       const checkConversation =await Conversations.find({members:{$in: [req.body.senderId,req.body.receiverId]}});
//       return res.status(200).json([]);
//     }

//     // Fetch the conversation to get participants
//     const conversation = await Conversations.findById(conversationId);

//     if (!conversation) {
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     // Assuming `participants` is an array of user IDs [senderId, receiverId]
//     const { members } = conversation;

//     // Fetch all messages for the conversation
//     const messages = await Messages.find({ conversationId });

//     // Extract the receiver's ID (the one not matching the sender in each message)
//     const messageReceiverData = await Promise.all(
//       messages.map(async (message) => {
//         const receiverId = members.find((id) => id !== message.senderId); // Get the receiver's ID

//         // Fetch receiver's details
//         const receiver = await Users.findById(receiverId);

//         return {
//           sender: {
//             id: message.senderId,
//             message: message.message,
//           },
//           receiver: {
//             id: receiver._id,
//             fullName: receiver.fullName,
//             email: receiver.email,
//           },
//         };
//       })
//     );

//     // Send the response
//     res.status(200).json(messageReceiverData);
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });
app.get("/api/message/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;
    const { senderId, receiverId } = req.query;

    console.log("Conversation ID:", conversationId);

    // If the conversation is new
    if (conversationId === "new") {
      const checkConversation = await Conversations.find({
        members: { $all: [senderId, receiverId] },
      });
      if (checkConversation.length > 0) {
        return res.status(200).json([]);
      } else {
        return res.status(200).json([]);
      }
    }

    // Fetch the conversation to get participants
    const conversation = await Conversations.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Assuming `members` is an array of user IDs [senderId, receiverId]
    const { members } = conversation;

    // Fetch all messages for the conversation
    const messages = await Messages.find({ conversationId });

    // Extract sender and receiver data for each message
    const messageReceiverData = await Promise.all(
      messages.map(async (message) => {
        const receiverId = members.find((id) => id !== message.senderId); // Get the receiver's ID

        // Fetch receiver's details
        const receiver = await Users.findById(receiverId);

        return {
          sender: {
            id: message.senderId,
            message: message.message,
          },
          receiver: {
            id: receiver._id,
            fullName: receiver.fullName,
            email: receiver.email,
          },
        };
      })
    );

    // Send the response
    res.status(200).json(messageReceiverData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




app.get("/api/users/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const users = await Users.find({_id: {$ne: userId}}); // $ne: not equal to 
    const usersData = Promise.all(
      users.map(async (user) => {
        return {
          user: {
            email: user.email,
            fullName: user.fullName,
            receiverId: user._id,
          },
        };
      })
    );
    res.status(200).json(await usersData);
  } catch (error) {
    console.log("Error " + error);
  }
});

app.listen(port, () => {
  console.log("listening on port " + port);
});
