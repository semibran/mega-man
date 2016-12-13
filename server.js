// Dependencies
const http    = require("http")
const express = require("express")
const path    = require("path")

const app    = express()
const server = http.createServer(app)
const PORT   = 3000

app.use(express.static(path.join(__dirname, "docs")))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "docs/index.html"))
})

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}.`)
})
