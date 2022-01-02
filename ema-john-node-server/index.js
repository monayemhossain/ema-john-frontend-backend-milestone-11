const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const app = express();
const port = 5000;
const cors =require("cors")

// middleware
app.use(cors());
app.use(express.json());

// demo GET API
app.get("/", (req,res) => { 
    res.send("server is already running")
})

// connect mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zighg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// mongodb connect function
async function run() { 
    try {
        await client.connect();
        const database = client.db("onlineShop");
        const productCollection = database.collection("products");
        const orderCollection= database.collection("orders")
      
        // GET Products API
        app.get("/products", async(req, res) => { 
            const cursor = productCollection.find({});
            const page = req.query.page;
            const size = parseInt(req.query.size);
            
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else { 
                products = await cursor.toArray();
            }
           
            res.send({
                count,
                products
            })
        }) 
        // app post to get data using key
        app.post("/products/byKeys", async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();
            res.json(products)
        })
        // orders api
        app.post("/orders", async(req, res) => { 
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result)
            
        })
    }

    finally { 
        // await client.close();
    }
}

run().catch(console.dir)


app.listen(port, (req,res) => {
    console.log("App is listening in port "+ port)
})