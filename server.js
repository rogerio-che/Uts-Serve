const net = require("net");

const users = new Map();
const clients = new Set();

function broadcastMessage(sender, message) {
  for (const client of clients) {
    if (client !== sender) {
      client.write(`${message}\n`);
    }
  }
}

function sendPrivateMessage(sender, recipient, message) {
  const recipientSocket = users.get(recipient);
  if (recipientSocket) {
    recipientSocket.write(`From ${sender}: ${message}\n`);
    sender.write(`(Send to ${recipient}): ${message}\n`);
  } else {
    sender.write(`User not found: ${recipient}\n`);
  }
}

function tryAcceptName(socket, name) {
  if (users.has(name)) {
    socket.write("Username already taken. Please try again:\n");
    return null;
  }

  users.set(name, socket);
  clients.add(socket);
  broadcastMessage(socket, `${name} has joined the chat!`);
  return name;
}

function handleClientLeaving(socket, name) {
  console.log(`${name} disconnected`);
  users.delete(name);
  clients.delete(socket);
  broadcastMessage(socket, `${name} has left the chat!`);
}

const server = net.createServer((socket) => {
  let name = null;

  console.log(
    `Connection from ${socket.remoteAddress} port ${socket.remotePort}`
  );
  socket.write("Welcome to the chat! Please enter your name:\n");

  socket.on("data", (buffer) => {
    const message = buffer.toString("utf-8").trim();

    if (!name) {
      name = tryAcceptName(socket, message);
    } else {
      if (message.startsWith("@")) {
        const spaceIndex = message.indexOf(" ");
        if (spaceIndex !== -1) {
          const recipient = message.substring(1, spaceIndex);
          const privateMessage = message.substring(spaceIndex + 1);
          sendPrivateMessage(socket, recipient, privateMessage);
        } else {
          socket.write(
            "Invalid command. Private message should be in the format '@<recipient> <message>'.\n"
          );
        }
      } else {
        broadcastMessage(socket, `${name}: ${message}`);
      }
    }
  });

  socket.on("end", () => handleClientLeaving(socket, name));
});

server.listen(1727, () => {
  console.log("Chat Server is Running Now");
});
