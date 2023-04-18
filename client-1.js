let net = require("net");
let readline = require("readline");

const client = new net.Socket();
client.connect(1727, process.argv[2] ?? "localhost", () => {
  console.log("Connected to server");
});
client.on("data", (data) => {
  console.log(data.toString("utf-8"));
});

const reader = readline.createInterface({ input: process.stdin });
reader.on("line", (line) => {
  if (line.startsWith("@")) {
    const [recipient, messageContent] = line.slice(1).split(" ");
    client.write(`@${recipient} ${messageContent}\n`);
  } else {
    client.write(`${line}\n`);
  }
});
