import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://raflimhmmd621_db_user:MuhRafli310104*@cluster0.ahx9jjw.mongodb.net/bimbel-lms?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const users = await mongoose.connection.db?.collection("users").find({
      role: { $in: ["owner", "admin", "guru", "siswa"] }
    }).toArray();

    if (!users) {
        console.log('No users found.');
        return;
    }

    const result = {
      owner: users.find(u => u.role === "owner")?.email,
      admin: users.find(u => u.role === "admin")?.email,
      guru: users.find(u => u.role === "guru")?.email,
      siswa: users.find(u => u.role === "siswa")?.email,
    };

    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

main();