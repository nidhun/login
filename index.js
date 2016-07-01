var express = require('express');
var router = express.Router();
var mysql = require("mysql");
var passwordHash = require('password-hash');
var fs = require('fs');//password reset 
var path = require('path');
var url =require('url');
var nodemailer=require('nodemailer');
var random= require('random-js');
var math= require('mathjs');
var multiparty=require('multiparty');
var path=require('path');
var randomstring = require("randomstring");
//sql connection
var con = mysql.createConnection({
  	host: "localhost",
  	user: "root",
  	password:"",
  	database:"login"
});
    con.connect(function(err){
  	    if(err){
  		    console.log('error connecting to db');
  		    return;
  	      }
  	console.log('connection established');
  }); 

/* GET home page. */
router.get('/', function(req, res, next){
console.log("jj",req.session.urefercode);

res.render('home', { title: 'Express' });
});
router.get('/login', function(req, res, next) {
res.render('login', { title: 'Express' });
}); 
router.get('/forgot', function(req, res, next) {
res.render('forgot', { title: 'Express' });
}); 
router.get('/reset', function(req, res, next) {
var token=req.query.tocken;//reading  ranm no
res.render('reset', { title: 'Express',tocken:token });
}); 
router.get('/signupvalidation', function(req, res, next){
res.render('signupvalidation', { title: 'Express'});
}); 

router.get('/logout', function(req, res, next) {

res.render('logout', { title: 'Express' });
}); 
//signup
router.post('/',function(req,res){    
//validation
 
var user_name=req.body.firstname;
var email=req.body.email;
var password=req.body.password;
var referal=req.body.referal;
console.log(referal);
var random1=randomstring.generate(5);
console.log(random1);
var reg1=/^[a-zA-Z ]{2,30}$/;
var reg=/^([A-za-z0-9_\-\.]){1,}\@([A-za-z0-9_\-\.]){1,}\.([A-za-z]{2,4})$/;
  if(user_name.length==0)
    {
  	  return void res.send("empty name");
    }
  else if(!reg1.test(user_name))
   {
	   return void res.send("invalid name format");
   }

  else if(email.length==0)
  {
	   return void res.send("Empty email");
	}
	else if(!reg.test(email))
	{
	   return void res.send("Invalid email formate");
	}
	else if(password.length<4 || password.length>8)
	{
		return void res.send('password shud b/w 4 and 8');
	}
	else
	{
 console.log("User name = "+user_name,"email =" +email," password is ="+password); 

//insert into database
var hashedPassword = passwordHash.generate(password);//hashing password
  var random = Math.floor(89999 * Math.random() + 1e4);

var data={
	  "name":user_name,
    "email":email,
	  "password":hashedPassword,
    "status":random
};

var query = "SELECT * FROM db WHERE email = ? ";
      
    con.query(query,[email], function (err, results){
       
      if(results.length==0){
            con.query("insert into db set ?",data,function(error,results){
      if(error)

        {
          throw error;
        }
      else//signup velidation
      {
          var insertid=results.insertId;
            
            
              var smtpTransport= nodemailer.createTransport({// email sending
                        service:"Gmail",
                        auth:{
                          user:"nidhunlastday@gmail.com",
                          pass:"8123361328"
                        }
                      });
                       var mailOptions = {
                        from:'nidhunlastday@gmail.com',
                        to:req.body.email,
                        subject:'hai its a test',
                        text:'this is your code',
                        html:'<a href="http://localhost:3000/signupvalidation">Please click here to confirm your account</a>'+random+''


                       };
                      smtpTransport.sendMail(mailOptions,function (err,results){
                        if(err){
                          console.log(err);
                         return void res.send("Something went wrong@");
                        }else{
                   
                           
                              
                          

                             
                                var ref={
                                "uid":insertid,
                                "refercode":random1,
                                "point":0
                              }

                            con.query("insert into refer set ?",ref,function (err,results){//signup refer page in
                              if(err){
                             
                                return void res.send("somthing went wrong1234");
                              }
                              else{ 
                                  if(referal){ //point update
                    
                        

                         var query = "SELECT * FROM refer WHERE refercode = ? ";

                          con.query(query,[referal],function (err,results){
                            if(err){
                        
                              return void res.send("somthing went while insert");
                            }
                            else{
                              if(results.length>0){
                                var point=results[0].point+10;


                                con.query("update refer set point=? where refercode=?",[point,referal],function (err,results){
                                  if(err){
                                
                                    return void res.send("faild to update");

                                  }
                                  else{
                                    return void res.send("signup complite please veryfy with email");
                                  }
                                });
                              }
                            }

                          });
                        }else{

                                return void res.send("Hii to confrim your account we sent link to your account please veryfy");
                             }
                              }
                            });

                        }

                            

                      
                      });
                     

                     
                
      }//signupvalidation till here
        

});
      }else{
                return void res.send("email alredy exist");
              }
});
      	
		
}
});

//validation of login page to database

router.post('/login',function(req,res,next){
   var email=req.body.email;
	 var pwd=req.body.password;

    console.log(req.session.email);
   var query = "SELECT * FROM db WHERE email = ? ";

   con.query(query,[email], function (err, results) {

  	 if(results.length>0)
  	   { 
        var Id=results[0].Id;
        console.log(Id);
        var hashedPassword = results[0].password; //varification hashed
    if((passwordHash.verify(pwd,hashedPassword))){
       //login email reg validation
        if(results[0].status==1){
          req.session.uid=results[0].Id;
          req.session.uemail=results[0].email;
          req.session.uname=results[0].name;
          console.log(req.session.uemail);
          var query="select * from refer where uid = ?";
          con.query(query,[Id],function (err,results){
            if(err){
              console.log(err);
              return void res.send("somthing went wrong");
            }else{
              if(results.length>0){
               req.session.ucode=results[0].refercode;

               

                 
              }
            }
          })
         
        
        

        res.render('profile');
       

       }else{
        res.send("please verfy  and come back");
       }

//till here login validation 

         
    }else{
        return void res.send("invalid password");
    }
  	
  	}
  	else
  	{
  		  return void res.send("invalid username");
  	}


});

});
router.post('/forgot',function(req,res,next){
  var reg=/^([A-za-z0-9_\-\.]){1,}\@([A-za-z0-9_\-\.]){1,}\.([A-za-z]{2,4})$/;
  var email=req.body.email;
 if(email.length==0){
           return void res.send("please enter email");
        }
        else if(!reg.test(email)){
               return void res.send("not in the format");
          }
    else
  var query = "SELECT * FROM db WHERE email = ? ";
      
    con.query(query,[email], function (err, results){
       if(err)
       {
         return void res.send("error on connection please try again");
       }
       else
        {
         if(results.length>0){
          var id=results[0].Id;//reading email id from database
           var random =  Math.floor(89999 * Math.random() + 1e4);//randm no gen

           var value={
              "token":random,
            "uid":id
          
         };   
            con.query("insert into pass_tocken set ?",value,function (err,results){
                  if(err){

                    return void res.send('somthing went wrong');
                  }
                    else
                    {
                  
                       var smtpTransport= nodemailer.createTransport({// email sending
                        service:"Gmail",
                        auth:{
                          user:"nidhunlastday@gmail.com",
                          pass:"8123361328"
                        }
                      });
                       var mailOptions = {
                        from:'nidhunlastday@gmail.com',
                        to:req.body.email,
                        subject:'hai its a test',
                        text:'hai itsa test:',
                        html:'<a href="http://localhost:3000/reset?tocken='+random+'">Please click here to reset the password</a>'


                       };
                      smtpTransport.sendMail(mailOptions,function (err,results){
                        if(err){
                          console.log(err);
                         return void res.send("Something went wrong");
                        }else{
                          console.log('massage sent:');

                          return void res.send("Email send to you account");
                        }

                      });

                    }
                  

                });
              }
      else
      {
        

           res.send('we dont have your email')

      }
      }
       
 });
 

});

router.post('/reset',function(req,res,next){
  var password=req.body.password;
  var password2=req.body.password2;
  var token=req.body.tocken;
  console.log(token);
  if((password==password2)) //match
  {
     var query = "SELECT * FROM pass_tocken where token= ? ";

     con.query(query,[token],function (err,results){
        if(err){
            return void res.send("error on connection");
             }
        else{
           if(results.length>0){
             var uid=results[0].uid;//read uid
          
              var hashedPassword = passwordHash.generate(password);//password hash

             con.query("update db set password=? where id=?",[hashedPassword,uid],function (err,results){
                if(err){
                   return void res.send("somthing wet wrong man");
                    }
              else{
                    if(results.affectedRows){
                      con.query("Delete from pass_tocken where token=?",[token],function (err,results){
                        if(err){
                          return void res.send("somthing went wrong..");

                        }
                        else{
                          return void res.send("successfully changed password");
                        }
                      })

                    }
                    else{
                      return void res.send("somthing went wrong");
                    }

                   
                 }

            })
          
          
        }
        else{
          return void res.send("link expried please try again");
        }


      }
    })
    
  }else{
     
     return void res.send("password does not match");
  }
});
router.post('/signupvalidation',function (req,res,next){
  
  var code=req.body.code;
  console.log(code);
  var i=1;
  var query ="select * from db where status=?";
      con.query(query,[code],function (err,results){
          if(err){
          return void res.send("somthing wrong please try");
                 }
          else{
             if(results.length>0){

             con.query("update db set status=?",[i],function (err,results){
              if(err){
              return void res.send("somthing went wrong");
                     }
             else{
                 res.render('login');
            }
          });


        }
        else{
          res.send("invalid activation code or link expire");
        }
        }
      });
     
    });


router.post('/logout',function(req,res,next){
  req.session.destroy(function(err,results){
    if(err){
      return void res.send("somthing wrong");
    }else{
      res.render('/');
    }
  });
});

module.exports = router;
