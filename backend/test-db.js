import mongoose from "mongoose";

const uri = "mongodb+srv://schooladmin123:Maarif12345@cluster0.faevmkq.mongodb.net/al_maarif_education?retryWrites=true&w=majority&appName=Cluster0";

console.log("Connecting to:", uri.replace(/:(.*)@/, ':***@'));

mongoose.connect(uri)
  .then(() => {
    console.log("Connected successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Connection error:", err);
    process.exit(1);
  });
