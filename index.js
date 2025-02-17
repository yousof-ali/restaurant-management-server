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
        if(req.query.category){
          option = {category:req.query.category}
        }
        const result = await foodCollections.find(option).toArray();
        res.send(result);
    });
    
    app.get('/single-food/:id',async(req,res) => {
      const id = req.params.id;
      const query = {_id:new ObjectId(id)};
      const result = await foodCollections.findOne(query);
      console.log(result);
      res.send(result)
    });

    app.put('/quantity/:id',async(req,res) => {
      const id = req.params.id
      const data = req.body.quantity
      const result = await foodCollections.updateOne(
        {_id:new ObjectId(id)},
        {$set:{quantity:data}}
      )
      res.send(result);
    })

    app.post('/order',async(req,res) => {
      const body = req.body
      const result = await orderCollections.insertOne(body);
      res.send(result);
    })

    app.get('/top-purchase',async(req,res) => {
      const purchaseData = await orderCollections.aggregate([
        {
          $group: {_id:"$product_ID",totalPurchase:{$sum:1}}
        },
        {
          $sort:{totalPurchase:-1}
        },
        {
          $limit:6
        }
      ]).toArray();
      const productID = purchaseData.map(item => new ObjectId(item._id));
      const products = await foodCollections.find({_id: {$in:productID}}).toArray();

      const mergeData = purchaseData.map(purchaseItem => {
        const product = products.find(prod => prod._id.toString() === purchaseItem._id.toString())
        return  product? {...product,totalPurchase:purchaseItem.totalPurchase} :null;
      }).filter(item => item !== null);
      res.send(mergeData);

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