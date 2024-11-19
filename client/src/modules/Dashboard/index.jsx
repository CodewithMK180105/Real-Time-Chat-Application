import Input from "../../components/Input";
import avatar from "../../assets/avatar-svgrepo-com.svg";
import { VscCallOutgoing } from "react-icons/vsc";
import { LuSend } from "react-icons/lu";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user:detail");
    return storedUser ? JSON.parse(storedUser).user : null; // Access 'user' object inside the stored data
  });
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({ receiver: null, messages: [] });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:detail"));
    if (!loggedInUser || !loggedInUser.user?.id) {
      console.error("Invalid user data in localStorage");
      return;
    }

    const fetchConversations = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/conversations/${loggedInUser.user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch conversations: ${res.statusText}`);
        }
        const resData = await res.json();
        setConversations(resData);
        // console.log(resData);
      } catch (error) {
        console.error("Error fetching conversations:", error.message);
      }
    };

    fetchConversations();
  }, []);

  // console.log(conversations);

  const fetchMessages = async (conversationId, user) => {
    console.log("Conversation ", conversationId);
    console.log("User ", user);
    try {
      const res = await fetch(
        `http://localhost:8000/api/message/${conversationId}?userId=${user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch messages: ${res.statusText}`);
      }
      const resData = await res.json();
      // console.log("Messages:", resData);
      console.log("Receiver:", user);
      setMessages({ messages: resData, receiver: user, conversationId }); // Directly set the response array
    } catch (error) {
      console.error("Error fetching messages:", error.message);
    }
  };

  // console.log(user);
  // console.log(conversations);
  // console.log(conversations.length);
  // console.log(messages);

  const sendMessage = async () => {
    const res = await fetch(`http://localhost:8000/api/message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversationId: messages?.conversationId,
        senderId: user?.id,
        message,
        receiverId: messages?.receiver?.receiverId,
      }),
    });
    // const reData=await res.json();
    // console.log("SendMessage: "+reData);
    setMessage("");
  };

  return (
    <div className="w-screen flex">
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
          <div className="text-blue-600 mb-3 text-center">Messages</div>
          <div>
            {conversations.length > 0 ? (
              conversations.map((conversation) => {
                // console.log(conversation.conversationId);
                return (
                  <div
                    key={conversation.user?.fullName} // Use conversation.name as the key for uniqueness
                    className="flex items-center cursor-pointer p-3 border-b border-b-g(ray-300 rounded-lg hover:bg-gray-200"
                    onClick={() =>
                      fetchMessages(conversation.conversationId, user)
                    }
                  >
                    <div
                      className={`border border-primary rounded-full ${
                        conversation.status === "active"
                          ? "bg-primary"
                          : "bg-light"
                      }`}
                    >
                      <img
                        src={avatar}
                        width={50}
                        height={50}
                        alt="profile pic"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl">{conversation.user?.fullName}</h3>
                      {/* Use the name property of conversation */}
                      <p className="text-sm font-light">
                        {conversation.user?.email}
                      </p>
                      {/* Use the status property */}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-12">
                No Messages
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        {messages.messages.length > 0 &&
          user?.id &&
          (() => {
            // Find the receiver based on the first message
            const receiver = messages?.messages
              .map(({ user }) => user)
              .find(({ id }) => id !== user?.id);

            return receiver ? (
              <div className="w-[75%] bg-secondary h-[80px] mt-6 mb-6 rounded-full flex items-center px-14">
                <div className="cursor-pointer">
                  <img src={avatar} width={75} height={75} alt="profile pic" />
                </div>
                <div className="ml-6 mr-auto">
                  <h3 className="text-lg">{receiver?.fullName}</h3>
                  <p className="text-sm font-light text-gray-600">
                    {receiver?.email}
                  </p>
                </div>
                <div className="cursor-pointer">
                  <VscCallOutgoing size={30} />
                </div>
              </div>
            ) : (
              <div className="w-[75%] bg-secondary h-[80px] mt-6 mb-6 rounded-full flex items-center px-14">
                <p className="text-lg">You cant see their, until they accept your request </p>
              </div>
            );
          })()}

        <div className="h-[75%] w-full overflow-y-scroll">
          <div className="p-10">
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ message, user: { id } = {}, _id }) => {
                return (
                  <div
                    key={_id || id} // Use a unique identifier like _id or id
                    className={`max-w-[40%] rounded-b-xl p-4 mb-6 ${
                      id === user.id
                        ? "bg-primary rounded-tl-xl ml-auto text-white"
                        : "bg-secondary rounded-tr-xl"
                    }`}
                  >
                    {message}
                  </div>
                );
              })
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Messages or No Conversations Selected
              </div>
            )}
          </div>
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

      <div className="w-[25%] h-screen bg-secondary"></div>
    </div>
  );
};

export default Dashboard;
