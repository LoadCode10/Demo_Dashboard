const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const {v4:uuid} = require('uuid');
const {format} = require('date-fns');

const logEvents = async(Message , logFileName)=>{
  const logCurrentTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  const logEventItem = `${logCurrentTime}\t${uuid()}\t${Message}\n`;

  try {
    if(!fs.existsSync('./Logs')){
      await fsPromises.mkdir(path.join(__dirname,'..','logs'));
    }
    await fsPromises.appendFile(path.join(__dirname,'..','logs',logFileName),logEventItem);

  } catch (error) {
    console.log(error);
  }
};

const logger = (req,res,next)=>{
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`,'reqLogs.txt');
  console.log(`${req.method} ${req.url}`);
  next();
}

module.exports = {logger,logEvents};
