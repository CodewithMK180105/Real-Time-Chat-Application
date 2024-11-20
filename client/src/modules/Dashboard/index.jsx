import Input from "../../components/Input";
import avatar from "../../assets/avatar-svgrepo-com.svg";
import { VscCallOutgoing } from "react-icons/vsc";
import { LuSend } from "react-icons/lu";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user:detail");
    return storedUser ? JSON.parse(storedUser).user : null; // Parse stored user data
  });

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({ receiver: null, messages: [] });
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        if (!user?.id) return; // Skip if user is not available
        const res = await fetch(
          `http://localhost:8000/api/conversations/${user.id}`
        );
        if (!res.ok) throw new Error("Failed to fetch conversations");
        const resData = await res.json();
        setConversations(resData);
      } catch (error) {
        console.error("Error fetching conversations:", error.message);
      }
    };
    fetchConversations();
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/users`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const resData = await res.json();
        setUsers(resData);
      } catch (error) {
        console.error("Error fetching users:", error.message);
      }
    };
    fetchUsers();
  }, []);

  const fetchMessages = async (conversationId, receiver) => {
    console.log(conversationId, receiver);
    try {
      const res = await fetch(
        `http://localhost:8000/api/message/${conversationId}`
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const resData = await res.json();
  
      // Ensure messages are set correctly
      setMessages({
        messages: resData.map((msg) => ({
          senderId: msg.sender.id,
          message: msg.sender.message,
        })),
        receiver: resData[0]?.receiver || receiver, // If receiver is available in the response, use it; otherwise, fall back to the passed receiver
        conversationId,
      });
  
      console.log(resData); // Check the structure of the response
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };
  

  const sendMessage = async () => {
    try {
      if (!message.trim()) return;
      const res = await fetch(`http://localhost:8000/api/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: messages.conversationId,
          senderId: user?.id,
          message,
          receiverId: messages?.receiver?.id,
        }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setMessage("");
      fetchMessages(messages.conversationId, messages.receiver); // Refresh messages
    } catch (error) {
      console.error("Error sending message:", error.message);
    }
  };

  console.log(messages);

  return (
    <div className="w-screen flex">
      {/* Sidebar: Conversations */}
      <div className="w-[25%] h-screen bg-secondary">
        <div className="flex justify-center items-center my-6">
          <div className="border border-primary rounded-full">
            <img src={avatar} width={75} height={75} alt="profile pic" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl">{user?.fullName}</h3>
            <p className="text-lg font-light">My Profile</p>
          </div>
        </div>
        <hr />
        <div className="mx-5 mt-5">
          <h4 className="text-blue-600 mb-3 text-center">Messages</h4>
          {conversations.length > 0 ? (
            conversations.map(({ conversationId, user }) => (
              <div
                key={conversationId}
                className="flex items-center cursor-pointer p-3 border-b border-gray-300 rounded-lg hover:bg-gray-200"
                onClick={() => fetchMessages(conversationId, user)}
              >
                <div className="border border-primary rounded-full">
                  <img src={avatar} width={50} height={50} alt="profile pic" />
                </div>
                <div className="ml-4">
                  <h3 className="text-xl">{user?.fullName}</h3>
                  <p className="text-sm font-light">{user?.email}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-lg font-semibold mt-12">
              No Messages
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        {messages.receiver && (
          <div className="w-[75%] bg-secondary h-[80px] mt-6 mb-6 rounded-full flex items-center px-14">
            <div>
              <img src={avatar} width={75} height={75} alt="profile pic" />
            </div>
            <div className="ml-6 mr-auto">
              <h3 className="text-lg">{messages.receiver?.fullName}</h3>
              <p className="text-sm font-light text-gray-600">
                {messages.receiver?.email}
              </p>
            </div>
            <VscCallOutgoing size={30} />
          </div>
        )}
        <div className="h-[75%] w-full overflow-y-scroll p-10">
          {messages.messages.length > 0 ? (
            messages.messages.map((msg, index) => (
              <div
                key={index}
                className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${
                  msg.senderId === user.id
                    ? "bg-primary rounded-tl-xl ml-auto text-white"
                    : "bg-secondary rounded-tr-xl"
                }`}
              >
                {msg.message}
              </div>
            ))
          ) : (
            <p className="text-center text-lg font-semibold mt-24">
              No Messages or No Conversations Selected
            </p>
          )}
        </div>

        {messages?.receiver?.fullName && (
          <div className="w-full flex items-center justify-evenly bg-white">
            <div className="p-2 w-[80%]">
              <Input
                placeholder="Type a message..."
                className="border-0 shadow-md rounded-lg bg-secondary"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div
              className={`rounded-full bg-secondary h-10 w-10 flex items-center justify-center ${
                !message ? "" : "cursor-pointer"
              }`}
              onClick={() => {
                sendMessage();
              }}
            >
              <LuSend
                size={25}
                className={`${!message ? "text-gray-400" : ""}`}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sidebar: Users */}
      <div className="w-[25%] h-screen bg-secondary px-8 py-12 overflow-scroll">
        <h4 className="text-primary text-lg">People</h4>
        {users.length > 0 ? (
          users.map(({ userId, user: userInfo }) => (
            <div
              key={userId}
              className="flex items-center py-4 border-b border-gray-300 cursor-pointer"
              onClick={() => fetchMessages("new", userInfo)}
            >
              <img
                src={avatar}
                className="w-[60px] h-[60] rounded-full p-[2px] border border-primary"
                alt="profile"
              />
              <div className="ml-6">
                <h3 className="text-lg font-semibold">{userInfo?.fullName}</h3>
                <h3 className="text-sm font-light text-gray-600">
                  {userInfo?.email}
                </h3>
              </div>
            </div>
          ))
        ) : (
          <p>No Users Found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
