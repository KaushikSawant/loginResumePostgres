const express = require("express");
const pg = require("pg");
const cors= require("cors");
const bcrypt = require('bcryptjs');
const app = express();
app.use(express.json());
app.use(cors());

const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    password: "root",
    database: "postgres",
    port: 5432
});

app.post('/register',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
    var hashedpassword;
    
    async function securityHash(fun){
        console.log("0");
        const salt = await bcrypt.genSalt(10);
        console.log(1);
        hashedpassword = await bcrypt.hash(password, salt);
        console.log(2);
        console.log("hashpass"+ " " + hashedpassword);
        console.log(3);
        fun();//first becrypt will fininsh the insert will be called bcoz of callback earlier insert was getting called with only email and hashing was taking time.
    }
    
    const insert=()=>{
        pool.query("INSERT INTO users (email,password) VALUES($1,$2)",
        [username, hashedpassword],console.log("4"),console.log("user"+ " "+ username+ " "+"dbq" + " " +hashedpassword),
        (err,result)=>{
        console.log(err);
    });
    }
    securityHash(insert);//callback
    //clear the text fields of username and pass other wise after starting server it will send those values first.
    
});
app.post('/login',(req,res)=>{
    const username = req.body.username;
    const password = req.body.password;
     
   pool.query("SELECT * FROM users WHERE email = $1",
   [username],
   (err,result)=>{
       if(err){
           res.send({err:err});
       }
       if(result.rows.length > 0){
           bcrypt.compare(password,result.rows[0].password);
           console.log(result.rows[0].password);
           if(result){
               console.log("success login");
           res.send(result.rows)
           //res.redirect("/Register");
           console.log("redirect");
        };
       }else{
           console.log("error");
           res.send({message:"wrong credentials"});
       }
   });
});

app.listen(3001, () => {
    console.log("running server"); 
});
