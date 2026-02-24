const { logEvents } = require('./logEvents');

const errorEventHandler = (err,req,res,next) =>{
  logEvents(`${err.name}\t${err.message}`,'errLogs.txt');
  console.error(err.stack);
  res.status(500).send(err.message);
};

module.exports = {errorEventHandler};