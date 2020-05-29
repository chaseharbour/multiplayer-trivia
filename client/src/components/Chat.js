import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InfoBar from "./InfoBar";
import Input from "./Input";
import Messages from "./Messages";
import RoomUsers from "./RoomUsers";
import Trivia from "./Trivia";

let socket;

const Chat = ({ location }) => {
  const [userName, setUserName] = useState("");
  const [room, setRoom] = useState("General");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState("");

  const ENDPOINT = "http://localhost:5000";

  //On mount: 1) destructures data from login with queryString 2) defines the socket connection 3) updates state of userName and room 4) emits data to server via socket
  useEffect(() => {
    const { userName, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setUserName(userName);
    setRoom(room);

    socket.emit("join", { userName, room }, () => {});

    return () => {
      socket.emit("disconnect");

      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("message", (message) => {
      setMessages((messages) => [...messages, message]);
    });

    socket.on("roomData", ({ users }) => {
      setUsersInRoom(users);
      console.log(usersInRoom);
    });

    socket.on("questionData", ({ questions }) => {
      console.log(questions);
    });
  }, []);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit("sendMessage", message, () => {
        setMessage("");
      });
    }
  };

  return (
    <div className="p-10">
      <div className="container h-auto mx-auto border-solid border-4 border-gray-600 p-2 rounded">
        <InfoBar room={room} />
        <div className="h-64 p-1 pb-0 mx-auto border-solid border-4 border-gray-500 rounded">
          <Messages messages={messages} userName={userName} />
        </div>
        <div className="mx-auto flex flex-col mt-4">
          <Input
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
        </div>
      </div>
      <RoomUsers users={usersInRoom} />
    </div>
  );
};

export default Chat;

//
//<Trivia />
//
