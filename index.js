const express = require("express");
const app = express();
const port = 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
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
    await client.connect();

    const addToyCollection = client.db("addedToys").collection("addedToys");

    // my Toys list
    app.get("/addToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await addToyCollection.find(query).toArray();
      res.send(result);
    });

    // send data from db to client
    app.get("/addToys", async (req, res) => {
      const cursor = addToyCollection.find().limit(20);
      const result = await cursor.toArray();
      res.send(result);
    });

    // getData from input field and insert db
    app.post("/addToys", async (req, res) => {
      const addedToys = req.body;

      const result = await addToyCollection.insertOne(addedToys);
      res.send(result);
    });

    // const serviceCollection = client.db('carDoctor').collection('services');
    // const bookingCollection = client.db('carDoctor').collection('bookings');

    // app.get('/services', async (req, res) => {
    //     const cursor = serviceCollection.find();
    //     const result = await cursor.toArray();
    //     res.send(result);
    // })

    // app.get('/services/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }

    //     const options = {
    //         // Include only the `title` and `imdb` fields in the returned document
    //         projection: { title: 1, price: 1, service_id: 1, img: 1 },
    //     };

    //     const result = await serviceCollection.findOne(query, options);
    //     res.send(result);
    // })

    // // bookings
    // app.get('/bookings', async (req, res) => {
    //     console.log(req.query.email);
    //     let query = {};
    //     if (req.query?.email) {
    //         query = { email: req.query.email }
    //     }
    //     const result = await bookingCollection.find(query).toArray();
    //     res.send(result);
    // })

    // app.post('/bookings', async (req, res) => {
    //     const booking = req.body;
    //     console.log(booking);
    //     const result = await bookingCollection.insertOne(booking);
    //     res.send(result);
    // });

    // app.patch('/bookings/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const filter = { _id: new ObjectId(id) };
    //     const updatedBooking = req.body;
    //     console.log(updatedBooking);
    //     const updateDoc = {
    //         $set: {
    //             status: updatedBooking.status
    //         },
    //     };
    //     const result = await bookingCollection.updateOne(filter, updateDoc);
    //     res.send(result);
    // })

    // app.delete('/bookings/:id', async (req, res) => {
    //     const id = req.params.id;
    //     const query = { _id: new ObjectId(id) }
    //     const result = await bookingCollection.deleteOne(query);
    //     res.send(result);
    // })

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
