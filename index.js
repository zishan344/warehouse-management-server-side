const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;

// const { ObjectID } = require("bson");

// middleware
app.use(cors());
app.use(express.json());
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.send(403).send({ message: "forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
  });
  next();
}

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
    // https://enigmatic-eyrie-33917.herokuapp.com/product
    app.post("/product", async (req, res) => {
      const body = req.body;
      const product = await furnitureCollection.insertOne(body);
      res.send(product);
    });
    // AUTH
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send({ accessToken });
    });

    //   get api all Products
    // https://enigmatic-eyrie-33917.herokuapp.com/products
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = furnitureCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // get api single product
    //https://enigmatic-eyrie-33917.herokuapp.com/product/{id}
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const cursor = await furnitureCollection.findOne(query);
      res.send(cursor);
    });

    app.get("/addProduct", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = furnitureCollection.find(query);
        const addProduct = await cursor.toArray();
        res.send(addProduct);
      } else {
        res.status(403).send({ message: "forbidden access" });
      }
    });

    //   update api
    //   https://enigmatic-eyrie-33917.herokuapp.com/product/id
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
    //    https://enigmatic-eyrie-33917.herokuapp.com/product/id
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await furnitureCollection.deleteOne(query);
      res.send(result);
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
