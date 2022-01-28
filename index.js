const express = require("express");
const res = require("express/lib/response");
const cors = require("cors");
require("dotenv").config();
const app = express();
const { MongoClient, Collection } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

//middle wire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lzm3u.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("test");
    const usersCollection = database.collection("users");

    //GET API
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const user = await usersCollection.findOne(query);
      //   console.log('load users with id');
      res.send(user);
    });

    //POST API
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      console.log("got new user", req.body);
      console.log(result);
      res.send(result);
    });

    //UPDATE API
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating user");
      res.json(result);
    });

    //DELETE API
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      console.log("Deleting an user", result);
      res.json(result);
    });
  } finally {
      // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Running Curd Server");
});

app.listen(port, () => {
  console.log("Running Server on port", port);
});
