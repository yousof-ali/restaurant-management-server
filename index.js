const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000


app.use(cors());
app.use(express.json());


app.get('/',(req,res) => {
    res.send("Restaurant Management Sarver!!")
});





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lewcb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const foodCollections = client.db('restaurantDB').collection("foods");
    const orderCollections = client.db('restaurantDB').collection("order");


    app.get('/foods',async(req,res) => {
        let option = {};
        const result = await foodCollections.find().toArray();
        res.send(result);
    });
    
    app.get('/single-food/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id:new ObjectId(id)};
      const result = await foodCollections.findOne(query);
      console.log(result);
      res.send(result)
    })

    app.post('/order',async(req,res) => {
      const body = req.body
      const result = await orderCollections.insertOne(body);
      res.send(result);
    })

    app.get('/order',async(req,res) => {

    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.listen(port,() => {
    console.log(`server is running on port ${port}`)
})