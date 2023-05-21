const express = require("express");
const app = express();
const port = 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");

require("dotenv").config();

//midleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is Runnig bro!");
});

console.log();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.34btmna.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const addToyCollection = client.db("addedToys").collection("addedToys");
    const addInsertGelleryCollection = client
      .db("insertToys")
      .collection("insertToys");

    // Inserted Gallary section

    app.get("/insertToys", async (req, res) => {
      const cursor = addInsertGelleryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Get all toys or filter by seller email
    app.get("/addToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await addToyCollection
        .find(query)
        .sort({ price: 1 })
        .toArray();

      // Convert the "price" field to a numeric type for correct sorting
      const sortedResult = result.map((toy) => ({
        ...toy,
        price: parseFloat(toy.price),
      }));

      // Sort the array based on the numeric "price" field
      sortedResult.sort((a, b) => a.price - b.price);

      res.send(sortedResult);
    });

    // Insert a new toy
    app.post("/addToys", async (req, res) => {
      const addedToy = req.body;
      const result = await addToyCollection.insertOne(addedToy);
      res.send(result);
    });

    // updating

    app.get("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToyCollection.findOne(query);
      res.send(result);
    });

    app.put("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedToys = req.body;
      const updateToyData = {
        $set: {
          description: updatedToys.description,
          quantity: updatedToys.quantity,
          price: updatedToys.price,
        },
      };
      const result = await addToyCollection.updateOne(
        query,
        updateToyData,
        options
      );
      console.log(result);
      res.send(result);
    });

    // Delete a toy by ID
    app.delete("/addToys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addToyCollection.deleteOne(query);
      res.send(result);
    });

    // // Search from db
    // const indexKeys = { name: 1 };
    // const indexOptions = { names: "toyZone" };
    // const result = await addToyCollection.createIndex(indexKeys, indexOptions);
    app.get("/searchByToyName/:text", async (req, res) => {
      const searchText = req.params.text;
      const result = await addToyCollection
        .find({
          name: { $regex: searchText, $options: "i" },
        })
        .toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Social media Server Run on port ${port}`);
});
