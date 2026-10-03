import { WebSocketServer } from "ws";
const server  = new WebSocketServer( {
    port : 5300 
})
server.on("connection" , (socket)=>{
    console.log("a user is connected.") ;
    setTimeout(()=>{
        console.log("the message from the server is sent.")
            socket.send("hello form the server.")
    }  , 1000)
    socket.on("message" , (message)=>{
        console.log("This is a message send from the client :" , message.toString() ) ;
        server.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                client.send("this is a message from the client A to the group members.")
            }
        })
    })
    socket.on("close" , ()=>{
        console.log(" A client is disconnected")
    })
    socket.on("error" , ()=>{
        console.log("the connection is lost because sth bad happened.")
    })
})