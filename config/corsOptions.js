const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:5173',
  'http://127.0.0.1:5501',
  'http://127.0.0.1:5500'
];

const corsOptions = {
  origin: function (origin,callback){
    if(!origin || allowedOrigins.includes(origin)){
      callback(null,true);
    }else{
      callback(new Error('Not Allowed By CORS'));
    }
  },
  optionsSuccessStatus : 200
};

module.exports = corsOptions;

