const localStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getuserByEmail){
    // authenticate users
    const authenticateusers = async(email,password,done)=>{
        const user = getuserByEmail(email)
        if(user == null){
            return done(null,false, {message:"No user found with that email"})
        }
        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null,user)
            }else{
                return done(null,false,{message:"Password incorrect"})
            }
        }catch(err){
            console.log(err)
            return done(err)
        }
    }

    passport.use(new localStrategy({usernameField:'email'}, authenticateusers ))
    passport.serializeUser((user,done)=> done(null,user.id))
    passport.deserializeUser((id,done)=>{
        return done(null, getUserById(id))
    })
}


module.exports = initialize