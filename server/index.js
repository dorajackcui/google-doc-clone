// require syntax
// const io = require("socket.io-client")
import { Server }  from "socket.io"
import connectDB from "./db.js"
import Document from "./Document.js"

const defaultValue = ''

const io = new Server(5000, {
  cors:{
    origin : "http://localhost:3000",
    methods : ["GET", "POST"],
  }
})

connectDB()

io.on("connection", socket => {

  //get document
  socket.on('get-document', async documentId => {
    const document = await findOrCreateDocument(documentId)
    socket.emit('load-document', document.data)
    socket.join(documentId)
    //listen text-change
    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta)
    })

    socket.on('save-document', async (data) => {
      await Document.findByIdAndUpdate(documentId, { data })
    } )
  })
  
  
})

async function findOrCreateDocument(id){
  if(id == null) return
  const document = await Document.findById(id)
  if (document) return document
  return await Document.create({ _id: id, data: defaultValue})
}