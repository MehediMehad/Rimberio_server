const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6u1ikeh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const producesCollection = client.db('fashionDB').collection('produces');
    const recommendCollection = client.db('fashionDB').collection('recommend');
    
    
    app.post('/produces', async(req, res)=>{
      const newProduces = req.body;
      console.log(newProduces);
      const result = await producesCollection.insertOne(newProduces)
      res.send(result)
    })

    // my user
    app.get('/myProduces/:email', async (req, res) =>{
      const result = await producesCollection.find({email: req.paramsemail}).toArray()
      res.send(result)
    })


    app.get('/produces', async (req, res) => {
      const cursor = producesCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })
    // delete
    app.delete('/deleteProduces/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await producesCollection.deleteOne(query)
      res.send(result);
    })

    

      // Recommend data save
      app.post('/recommend', async (req, res) => {
        const recommendData = req.body
        const result = await recommendCollection.insertOne(recommendData)
        res.send(result)
      })

      // get 
      // app.get('/recommend/:email', async (req, res) =>{
      //   const email = req.params.email
      //   const query = {'recommendedUser.email':email}
      //   const result = await recommendCollection.find(query).toArray()
      //   res.send(result)
      // })

      app.get('/recommend', async (req, res) =>{
        const cursor = recommendCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })
      // delete



    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


















app.get('/', (req, res) => {
    res.send('server is running')
})

app.listen(port, () =>{
    console.log(`Server running on port${port}`);
})