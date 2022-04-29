const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
const cors = require("cors");
const { ObjectID } = require("bson");

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iqmsj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    console.log("connect done");
    const furnitureCollection = client
      .db("furniture-warehouse")
      .collection("products");
    //  post api single product
    app.post("/product", async (req, res) => {
      const body = req.body;
      const product = await furnitureCollection.insertOne(body);
      res.send(product);
    });

    //   get api all Products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = furnitureCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);

      //   update api
      app.put("/product/:id", async (req, res) => {
        const id = req.params.id;
        const updateBody = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
          $set: updateBody,
        };
        const result = await furnitureCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      });

      //delete api
      app.delete("/product/:id", async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectID(id) };
        const result = await furnitureCollection.deleteOne(query);
        res.send(result);
      });
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at ${port}`);
});
