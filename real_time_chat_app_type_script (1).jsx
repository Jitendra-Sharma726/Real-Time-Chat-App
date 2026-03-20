import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

let socket: Socket;

interface Message {
  text: string;
  user: string;
}

export default function ChatApp() {
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    socket = io("http://localhost:3001");

    socket.on("receive_message", (data: Message) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim()) {
      const msgData = { text: message, user: username };
      socket.emit("send_message", msgData);
      setMessages((prev) => [...prev, msgData]);
      setMessage("");
    }
  };

  if (!joined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="p-6 w-96">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">Join Chat</h2>
            <Input
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Button className="mt-4 w-full" onClick={joinChat}>
              Join
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-3">Real-Time Chat</h2>

          <div className="h-80 overflow-y-auto border rounded p-2 mb-3 bg-white">
            {messages.map((msg, idx) => (
              <div key={idx} className="mb-2">
                <strong>{msg.user}: </strong>
                <span>{msg.text}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={message}
              placeholder="Type a message"
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- BACKEND (Node.js + Socket.io) ----------------

Create a separate file: server.ts

---------------------------------------------------------------

import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("send_message", (data) => {
    socket.broadcast.emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("Server running on port 3001");
});

---------------------------------------------------------------- */
