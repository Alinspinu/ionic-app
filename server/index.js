if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}


const express = require('express')
const path = require("path");
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const QA = require('./models/q-a')
const { ObjectId } = require('mongodb')
const cors = require('cors');

const baseMogoUrl = 'mongodb://127.0.0.1:27017/'



const corsOptions = {
    origin: ['https://faq-app-a7297.web.app', 'http://localhost:8100'],

    optionSuccessStatus: 200,
}

app.use(cors(corsOptions));




app.use(bodyParser.json());



let isRouteEnabled = true

const disableRouteMiddleware = (req, res, next) => {
    if (isRouteEnabled) {
        next();
        isRouteEnabled = false;
    } else {
        res.status(403).json({ message: 'Route is disabled' });
    }
}


app.post('/api/createDb', disableRouteMiddleware, async (req, res) => {
    console.log(req.body.params, req.body)
    const { dbName, collName } = req.body;

    try {
        //Connect to MongoDB mongodb://127.0.0.1:27017
        const client = await MongoClient.connect(`${baseMogoUrl}${dbName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB database!');

        // Create a collection
        const db = client.db(dbName);
        const collection = await db.createCollection(collName);

        console.log(`Collection ${collection.collectionName} created!`);

        // Disconnect from MongoDB database
        await client.close();

        console.log('Disconnected from MongoDB database!');


        res.status(200).json(`Collection ${collName} created successfully!`)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.post('/api/upload-batch', async (req, res, next) => {
    const { dbName, collName } = req.query
    const data = req.body
    try {
        const client = await MongoClient.connect(`${baseMogoUrl}${dbName}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB database!');
        const filteredDocs = data.filter(doc => doc.question && doc.answer)
        if (filteredDocs.length < 2) {
            return res.status(206).json(`Unsucesful! You need to have at least two valid documents for saving`)
        }
        const db = client.db();
        const collection = db.collection(collName);
        await collection.insertMany(filteredDocs)
        res.status(200).json(`Documents successfully saved`)

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }

})

app.delete('/api/deleteAll', async (req, res, next) => {
    if (req.query) {
        try {
            const { dbName, collName } = req.query
            const client = await MongoClient.connect(`${baseMogoUrl}${dbName}?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0`,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
            console.log('Connected to MongoDB database!');
            const db = client.db();
            const collection = db.collection(collName);
            await collection.deleteMany({})

            res.status(200).json('All documents are successfully deleted')

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({ message: 'Bad request' })
    }

})

app.get('/api/fetch-items', async (req, res, next) => {
    const { dbName, collName } = req.query
    const docs = await getAllDocuments(dbName, collName)
    if (docs) {
        res.status(200).json(docs)
    } else {
        res.status(404).json({ message: 'Documents not found' })
    }
})

app.put('/api/edit-items', async (req, res, next) => {
    if (req.body && req.query) {
        try {
            const { dbName, collName } = req.query
            const { question, answer } = req.body
            const id = new ObjectId(req.body._id)
            console.log(id)
            const client = await MongoClient.connect(`${baseMogoUrl}${dbName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB database!');
            const db = client.db();
            const collection = db.collection(collName);
            await collection.findOneAndReplace({ _id: id }, { question: question, answer: answer })

            res.status(200).json(`Document successfully updated`)

        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({ message: 'Bad request' })
    }

})

app.post('/api/new-item', async (req, res, next) => {
    if (req.body && req.query) {
        try {
            const { dbName, collName } = req.query
            const { question, answer } = req.body
            const client = await MongoClient.connect(`${baseMogoUrl}${dbName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB database!');
            const db = client.db();
            const collection = db.collection(collName);
            const newDoc = await collection.insertOne({ question: question, answer: answer })
            const id = newDoc.insertedId
            res.status(200).json({ message: `Document successfully saved`, id: id })
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({ message: 'Bad request' })
    }
})

app.delete('/api/delete-item', async (req, res, next) => {
    console.log(req.query)
    if (req.query) {
        try {
            const { dbName, collName, id } = req.query
            const _id = new ObjectId(id)
            console.log(_id)
            const client = await MongoClient.connect(`${baseMogoUrl}${dbName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('Connected to MongoDB database!');
            const db = client.db();
            const collection = db.collection(collName);
            collection.deleteOne({ _id: _id }).then(response => {
                console.log(response)
            })

            res.status(200).json(`Document successfully deleted`)
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    } else {
        return res.status(400).json({ message: 'Bad request' })
    }
})

async function getAllDocuments(dbName, collName) {
    const client = new MongoClient(`${baseMogoUrl}${dbName}`);
    try {
        await client.connect();
        const collection = client.db(dbName).collection(collName);
        const documents = await collection.find().toArray();
        return documents;
    } finally {
        await client.close();
    }
}



const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
    console.log(
        "Welcome to FAQ App. Open the browser at: http://localhost:3000 and enjoy a great app!"
    );
});