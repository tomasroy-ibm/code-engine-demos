const Express = require("express")
const BodyParser = require('body-parser');
const fs = require("fs")
const { MongoClient, ObjectID } = require("mongodb");

// Setup Express server
const server = Express()
const port = process.env.PORT || 8080

// Setup database client if credentials exist
let mongoURI, mongoDatabaseName, mongoClient, db
if (process.env.DATABASES_FOR_MONGODB_CONNECTION) {
    let mongoCreds = JSON.parse(process.env.DATABASES_FOR_MONGODB_CONNECTION).mongodb

    // Write cert to filesystem
    fs.writeFileSync(mongoCreds.certificate.name, mongoCreds.certificate.certificate_base64, { encoding: "base64" })

    // Get needed variables
    mongoDatabaseName = mongoCreds.database
    mongoURI = mongoCreds.composed[0]
    
    // Create new MongoDB client
    mongoClient = new MongoClient(mongoURI, {
        tls: true,
        tlsCAFile: mongoCreds.certificate.name,
        useUnifiedTopology: true,
    })
}

// Setup backend
server.use(BodyParser.json())
server.post("/todo", (req, res) => {
    if (!db) return res.status(500).send("No database found")
    let todo = {
        title: req.body.title,
        complete: false,
    }
    db.collection("todos").insertOne(todo).then(result => {
        res.status(200).send()
    }).catch(err => {
        res.status(500).send(err)
    })
})
server.patch("/todo", (req, res) => {
    if (!db) return res.status(500).send("No database found")
    db.collection("todos").updateOne({"_id": ObjectID(req.body.id)}, {"$set": {complete: req.body.complete}}).then(result => {
        res.status(200).send()
    }).catch(err => {
        console.log(err)
        res.status(500).send(err)
    })
})
server.get("/todos", (req, res) => {
    if (!db) return res.status(500).send("No database found")
    db.collection("todos").find().toArray().then(todos => {
        res.status(200).json({ todos })
    }).catch(err => {
        res.status(500).send(err)
    })
})

// Setup frontend
server.use(Express.static('public'))
server.get('/', (req, res) => res.sendFile('./public/index.html'))

if (mongoClient) {
    console.log(`Connecting to MongoDB at ${mongoURI}...`)
    mongoClient.connect(function(err) {
        if (err) return console.error(err)
        console.log("Connected to database!");
        db = mongoClient.db(mongoDatabaseName);
    });
}
server.listen(port, () => console.log(`Express listening on ${port}...`))
