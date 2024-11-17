import Input from "../../components/Input";
import avatar from "../../assets/avatar-svgrepo-com.svg";
import { VscCallOutgoing } from "react-icons/vsc";
import { LuSend } from "react-icons/lu";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const contacts = [
    {
      name: "Alice",
      status: "active",
      img: avatar,
    },
    {
      name: "Bob",
      status: "inactive",
      img: avatar,
    },
    {
      name: "Charlie",
      status: "active",
      img: avatar,
    },
    {
      name: "Diana",
      status: "inactive",
      img: avatar,
    },
    {
      name: "Eve",
      status: "active",
      img: avatar,
    },
    {
      name: "Frank",
      status: "inactive",
      img: avatar,
    },
  ];

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:detail"));
    console.log(loggedInUser);
    console.log(loggedInUser.user.id);
    const fetchConversations = async () => {
      const res = await fetch(
        `http://localhost:8000/api/conversations/${loggedInUser.user.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = await res.json();
      console.log(resData);
      setConversations(resData);
    };
    fetchConversations();
  }, []);

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user:detail");
    return storedUser ? JSON.parse(storedUser).user : null; // Access 'user' object inside the stored data
  });
  const [conversations, setConversations] = useState([]);
  // console.log(user);
  console.log(conversations);
  console.log(conversations.length);

  return (
    <div className="w-screen flex">
      <div className="w-[25%] h-screen bg-secondary">
        <div className="flex justify-center items-center my-6">
          <div className="border border-primary rounded-full">
            <img src={avatar} width={75} height={75} alt="profile pic" />
          </div>
          <div className="ml-4">
            <h3 className="text-2xl">{user.fullName}</h3>
            <p className="text-lg font-light">My Profile</p>
          </div>
        </div>
        <hr />
        <div className="mx-5 mt-5">
          <div className="text-blue-600 mb-3 text-center">Messages</div>
          <div>
            {conversations.map((conversation) => {
              console.log(conversation);
              return (
                <div
                  key={conversation.name} // Use conversation.name as the key for uniqueness
                  className="flex items-center cursor-pointer p-3 border-b border-b-gray-300 rounded-lg hover:bg-gray-200"
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
                    <h3 className="text-xl">{conversation.name}</h3>{" "}
                    {/* Use the name property of conversation */}
                    <p className="text-sm font-light">
                      {conversation.status}
                    </p>{" "}
                    {/* Use the status property */}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-[50%] h-screen bg-white flex flex-col items-center">
        <div className="w-[75%] bg-secondary h-[80px] mt-6 mb-6 rounded-full flex items-center px-14">
          <div className="cursor-pointer">
            <img src={avatar} width={75} height={75} alt="profile pic" />
          </div>
          <div className="ml-6 mr-auto">
            <h3 className="text-lg">Alexander</h3>
            <p className="text-sm font-light text-gray-600">online</p>
          </div>
          <div className="cursor-pointer">
            <VscCallOutgoing size={30} />
          </div>
        </div>
        <div className="h-[75%] w-full overflow-y-scroll">
          <div className="p-10">
            <div className="p-4 max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl mb-3">
              Lorem ipsum
            </div>
            <div className="p-4 max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white mb-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>
            <div className="p-4 max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl mb-3">
              Lorem ipsum
            </div>
            <div className="p-4 max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white mb-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>
            <div className="p-4 max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl mb-3">
              Lorem ipsum
            </div>
            <div className="p-4 max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white mb-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>
            <div className="p-4 max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl mb-3">
              Lorem ipsum
            </div>
            <div className="p-4 max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white mb-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>
            <div className="p-4 max-w-[40%] bg-secondary rounded-b-xl rounded-tr-xl mb-3">
              Lorem ipsum
            </div>
            <div className="p-4 max-w-[40%] bg-primary rounded-b-xl rounded-tl-xl ml-auto text-white mb-3">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </div>
          </div>
        </div>
        <div className="w-full flex items-center justify-evenly bg-white">
          <div className="p-2 w-[80%]">
            <Input
              placeholder="Type a message..."
              className="border-0 shadow-md rounded-lg bg-secondary"
            />
          </div>
          <div className="rounded-full bg-secondary h-10 w-10 flex items-center justify-center cursor-pointer">
            <LuSend size={25} />
          </div>
        </div>
      </div>

      <div className="w-[25%] h-screen bg-secondary"></div>
    </div>
  );
};

export default Dashboard;
