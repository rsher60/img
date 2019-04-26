const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');




//additions on 2/4/2019 in modules 


////

const app = express();
//middleware 
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(methodOverride('_method'));

//mongodb URI
//const mongoURI ="mongodb://localhost:27017/test-database-1";

const mongoURI ="mongodb://mongo:27017/test-database-1";

//create a mongo connection
const conn = mongoose.createConnection(mongoURI);

//initialise gfs 
let gfs;
conn.once('open',() =>{
    //initialise the stream
    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('collection');
    
})
//create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'collection'
           
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });

//@route GET /
//@desc Loads form 

app.get('/', (req,res) => { 
    res.render('index');
});
//@route POST /upload
//@desc uploads file to db

app.post('/upload',upload.single('file'),(req,res) =>{
//res.json({file:req.file});
res.redirect('/')
});

//@route GET /files
//@desc display all files in json 
app.get('/files',(req,res) => {
    gfs.files.find().toArray((err,files)=>{
        //check if any files exist
        if(!files || files.length === 0){
            return res.status(404).json({
                err:'no files exist'
            });
        }
        res.setHeader("Content-Type", "application/json");
        return res.json(files);
       // console.log(res.json(files));
       
        
    });
   
});
// addition on 2/4/2019




app.get('/files/:filename',(req,res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file) => {

        if(!file || file.length === 0){
            return res.status(404).json({
                err:'no files exist'
            });
        }
        //file exists
        return res.json(file);
        
    });
});
//@route GET /image/:filename
//app.get('/image/:filename',(req,res)=>{
app.get('/:filename',(req,res)=>{
    gfs.files.findOne({filename: req.params.filename},(err,file) => {

        if(!file || file.length === 0){
            return res.status(404).json({
                err:'no files exist'
            });
        }
        //check if image
        if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
            //read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res,"heelo");

            // new additions on 2/4/2019
            
          

        }else{
            
            res.status(404).json({
                err:'not an image'

            });
        }
        
    });
});

app.get('/get-data', function(req, res, next) {
    var resultArray = [];
    mongo.connect(url, function(err, db) {
      assert.equal(null, err);
      var cursor = db.collection('collection').find();
      cursor.forEach(function(doc, err) {
        assert.equal(null, err);
        resultArray.push(doc);
      }, function() {
        db.close();
        //res.render('index4', {items: resultArray});
        console.log(resultArray);
        return res.json(resultArray);
      });
    });
  });

const port = 5000;
app.listen(port , () => console.log('server started on port ${port}'));


