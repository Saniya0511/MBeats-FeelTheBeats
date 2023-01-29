const express = require('express');
const path = require('path');
const { body, validationResult } = require("express-validator");
const bodyParser = require('body-parser');
require("dotenv").config();

const app = express();

// DATABASE
const mongoose = require('mongoose');
// url for mongodb cluster
const url = process.env.DB_URL;
mongoose.set('strictQuery', false);
const ConnectDB = async()=>{
    try{
        // connecting to mongodb cluster
        const conn = await mongoose.connect(url);
        console.log(`MongoDB Connected : ${conn.connection.host}`)
    }catch(error){
        console.log(error);
        process.exit(1);
    }
}
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    img: {
        type: String,
        required: true
    },
    
})
const MBeats = new mongoose.model('MBeats', userSchema);

app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');

// HOME Page
app.get('/', (req, res)=>{
    res.render('register');
})

// REGISTER Page
app.get('/register', (req, res)=>{
    res.render('register');
})
app.post('/register', async (req, res) => {
    try {
        if (req.body.name && req.body.email && req.body.password) {
            email = req.body.email;
            let usermail = await MBeats.findOne({ email: email });

            if (usermail) {
                return res.render('register', { msg: 'Error: Email already registered.Please login' })
            } else if (req.body.password === "zero") {
                return res.render('register', { msg: 'Error: No Face Detected. Please Try Again' })
            } else if (req.body.password === "many") {
                return res.render('register', { msg: 'Error: Mutiple Faces Detected. Please Try Again' })
            }
            else {
                const userinfo = new MBeats({
                    name: req.body.name,
                    email: req.body.email,
                    img: req.body.password
                })
                userinfo.save();
                res.status(200).render('login');
            }
        }
        else {
            res.render('register', { msg: 'Error: Please capture your image.' })
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

// LOGIN Page
app.get('/login', (req, res)=>{
    res.render('login');
})
app.post('/login',async (req,res)=>{
    try{
        if(req.body.email){
            const email = req.body.email;
            const usermail = await MBeats.findOne({ email: email }) 
            if(usermail){
                res.status(200).render('verify',{username:usermail.name,imgurl:usermail.img});
            }else{
                res.render('login',{ msg: 'Error: Invalid Email' }) 
            }
        }
        else{
            res.render('login',{ msg: 'Please fill in all the details.' })
        }
    }
    catch (error) {
        res.status(400).send(error);
    }
})

// VERIFY Page
app.get('/verify', (req, res)=>{
    res.render('verify');
})
app.post('/verify', async (req, res) => {
    try {
        if (req.body.password) {
            if(req.body.password==="zero"){
                res.render('verify', { msg: 'Error: No Face Detected.' }) 
            }else if(req.body.password==="many"){
                res.render('verify', { msg: 'Error: Multiple Faces Detected.' })  
            }else if(req.body.password==="unknown"){
                res.render('verify', { msg: 'Error: Face Not Registered. Try Again.' })
            }else if(req.body.password==="abc"){
                res.render('verify',{msg: 'Error: Wait for complete verification.'})
            }else{
                res.render('index');
            } 
        } else {
            res.render('verify', { msg: 'Error: Please verify your account first.' })
        }
    } catch (error) {
        res.status(400).send(error);
    }
})

// INDEX Page
app.get('/index', (req, res) => {
    res.render('index')
})

//MOOD Page
app.get('/mood', (req, res)=>{
    res.render('mood')
})
app.post('/mood', (req, res) => {
    const mood=req.body.moodtype;
    res.render('filter',{moodtype:mood});
})

//ECOMM
app.get('/ecomm', (req, res) => {
    res.render('ecomm')
})

ConnectDB().then(()=>{
    app.listen(process.env.PORT || 3000);
});