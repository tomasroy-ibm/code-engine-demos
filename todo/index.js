const Express = require("express")
const { MongoClient } = require("mongodb")

const server = Express()

let database;

// Setup backend
server.post("/todo", (req, res) => {
    if (!database) return res.status(500).send("No database found")
})
server.put("/todo", (req, res) => {
    if (!database) return res.status(500).send("No database found")
})
server.get("/todos", (req, res) => {
    if (!database) return res.status(500).send("No database found")
    res.status(200).json({
        todos: [
            { id: '12345', title: 'Some todo', complete: true },
        ],
    })
})

// Setup frontend
server.use(Express.static('public'))
server.get('/', (req, res) => res.sendFile('./public/index.html'))

const port = process.env.PORT || 8080
server.listen(port, () => console.log(`Express listening on ${port}...`))