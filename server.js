require('dotenv').config();
const {google} = require('googleapis');
const http = require('http');
const {Server} = require('socket.io');
const express = require('express');
const app = express();
// Wrap Express in an HTTP server
const server = http.createServer(app);
// Attach Socket.io to that server
const io = new Server(server,{
  cors:{ origin:"*"}
});
const { checkEmails } = require('./services/gmailService.js');
const path = require('path');
const { logger } = require('./middleware/logEvents.js');
const { errorEventHandler } = require('./middleware/ErrorEvents.js');
const corsOptions = require('./config/corsOptions.js');
const  cors  = require('cors');
const mongoose =require('mongoose');
const connectDB = require('./config/dbConn.js');


const PORT = process.env.PORT || 8080;

connectDB();

app.use(logger);

app.use(cors(corsOptions));

app.use(express.urlencoded({extended:false}));

app.use(express.json());

app.use(express.static(path.join(__dirname,'/public')));

//here i'll put my routes
app.use('/',require('./routes/dashboard.js'));
app.use('/api/tasks',require('./routes/api/tasks.js'));
app.use('/api/members',require('./routes/api/members.js'));
app.use('/api/emails',require('./routes/api/emails.js'));


app.use((req,res)=>{
  res.status(404);
  if(req.accepts('html')){
    res.sendFile(path.join(__dirname,'views','404.html'));
  }else if(req.accepts('json')){
    res.json({'error':"404 Not Found!"});
  }else{
    res.type('text').send('404 Not Found');
  }
  res.status(404)
});

app.use(errorEventHandler);

io.on("connection",(socket)=>{
  console.log("User Connected", socket.id);
  socket.on("disconnect", ()=>{
    console.log("User disconnected");
  })
});

setInterval(()=> checkEmails(io), 15000);

mongoose.connection.once('open',()=>{
  console.log('Connected to MongoDB');
  server.listen(PORT,()=>{
    console.log(`Server Listening on http://localhost:${PORT}`);
  });
});