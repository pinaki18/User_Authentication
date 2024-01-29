if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


const express = require('express')
const app = express()
const bcrypt = require("bcrypt")   
const passport = require("passport")
const initializePassport = require("./passport-config")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const collection = require('./mongodb')


initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
    )

const users = []

app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method")) 


app.post("/login",checkOnAuthenticated, passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect:"/login",
    failureFlash:true
}))



app.post("/register",checkOnAuthenticated, async (req,res)=>{

    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        // users.push({
            // id: Date.now().toString,
            // name: req.body.name,
            // email: req.body.email,
            // password: hashedPassword,
        // })
        const data = {
            id: Date.now().toString,
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
        }

        await collection.insertMany([data]);

        // console.log(users)
        res.redirect('/login')
    }catch(err){
        console.log(err)
        res.redirect('/register')
    }
})

// Routes
app.get('/',checkAuthenticated, (req,res)=>{
    res.render("index.ejs", {name:req.user.name})
})

app.get('/login', checkOnAuthenticated, (req,res)=>{
    res.render("login.ejs")
})

app.get('/register',checkOnAuthenticated, (req,res)=>{
    res.render("register.ejs")
})
// Routes end

app.delete("/logout", (req,res)=>{
    req.logout(req.user, err=>{
        if(err) return next(err)
        res.redirect("/")
    })
})


function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkOnAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}



app.listen(3000);