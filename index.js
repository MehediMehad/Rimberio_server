const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cardoctor-bd.web.app",
      "https://cardoctor-bd.firebaseapp.com",
    ],
    credentials: true,
  })
);
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

    const producesCollection = client.db('fashionDB').collection('produces');
    const recommendCollection = client.db('fashionDB').collection('recommend');

    // jwt Generate
    app.post('/jwt', async(req, res) =>{
      const user = req.body;
      console.log(user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn:'365d'
      })
      res.cookie('token', token, {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      })
      .send({success: true})
    })

    // clear token on logout
    app.get('/logout', (req, res) =>{
      res.clearCookie('token',  {
        httpOnly:true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 0,
      })
      .send({success: true})
    })

    // get all data 
    app.post('/Addproduces', async(req, res)=>{
      const newProduces = req.body;
      console.log(newProduces);
      const result = await producesCollection.insertOne(newProduces)
      res.send(result)
    })

    // get data spastic user
    app.get('/myProduces/:email', async (req, res) =>{
      const email = req.params.email
      const query = {'addedUser.email':email}
      const result = await producesCollection.find(query).toArray()
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
    // update
        // Update
        app.get("/item/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) };
          const result = await producesCollection.findOne(query);
          res.send(result);
        });
        //reason, productTitle, photo, name, brand,
        app.put("/item/:id", async (req, res) => {
          const id = req.params.id;
          const itemData = req.body
          const query = { _id: new ObjectId(id) };
          const options = { upsert: true };
          const itemDoc = {
            $set: {
              ...itemData
            },
          };
          const result = await producesCollection.updateOne(query, itemDoc, options )
          res.send(result);
        });

    

      // Recommend data save
      app.post('/recommend', async (req, res) => {
        const recommendData = req.body
        const result = await recommendCollection.insertOne(recommendData)
        res.send(result)
      })

      // get 
      app.get('/recommend/:email', async (req, res) =>{
        const email = req.params.email
        const query = {'recommendedUser.email':email}
        const result = await recommendCollection.find(query).toArray()
        res.send(result)
      })

      app.get('/recommend', async (req, res) =>{
        const cursor = recommendCollection.find()
        const result = await cursor.toArray()
        res.send(result)
      })
      // delete recommend
      app.delete('/deleteRecommend/:id', async (req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await recommendCollection.deleteOne(query)
        res.send(result);
      })
      



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