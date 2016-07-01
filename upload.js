var express = require('express');
var router = express.Router();

var fs = require('fs');//password reset 
var multiparty=require('multiparty');
var mysql = require("mysql");
var nodemailer=require('nodemailer');
var randomstring = require("randomstring");


router.use('/',function(req,res,next){
  
  if(req.session.uid){
  console.log(req.session.uid);


    next();
  }
  else
  {
    return void res.send("Plsese login and contionue");
  }

});
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

router.get('/',function(req,res,next){

  res.render('profile',{title:'Express'});



});
router.post('/',function(req,res,next){
var form=new multiparty.Form();//reading



  form.parse(req,function (err,fileds,files){

   if(err){
    return void res.send('somthing went wrong');
   }else{

      var reg1=/^[a-zA-Z ]{2,30}$/;
      var first_name=fileds.first_name;//filed reading models
      var last_name=fileds.last_name;
      var street_address=fileds.street_address;
      var state=fileds.state;
      var city=fileds.city;
      var zip=fileds.zip;
      var member=fileds.member;

    
      var tmp_path=files.file[0].path;
      var target_path='public/uploads/' + files.file[0].originalFilename;
      if(fileds.first_name==0){
        return void res.send('please enter the name');
      }
      
      else if(fileds.last_name==0){
        return void res.send("please enter the last name");

      }else if(fileds.street_address==0){
        return void res.send('please enter the street');
      }
      else if(fileds.state==0){
        return void res.send("please enter the state");
      }
      else if(fileds.city==0){
        return void res.send("please enter the city");
      }
      else if(fileds.zip==0){
        return void res.send('please enter the zip');
      }else{
        console.log("first name="+first_name,"last name="+last_name,"street address="+street_address,"state="+state,"city="+city,"zip="+zip);
        
        

        var fileds={
        "first name":first_name,
        "last name":last_name,
        "street address":street_address,
        "city":city,
        "state":state,
        "zip":zip,
        "uid":req.session.uid
      }
     
    con.query("insert into profile set ?",fileds,function (err,results){
      if(err){
        console.log(err);
        return void res.send("error1");

      }



      if(results.affectedRows)
      {  

        fs.access(tmp_path, fs.F_OK, function(err) {
          if(err){
            console.log(err);
            return void res.send('somthing went wrong ');
          }else{
            fs.readFile(tmp_path, function (err, data) {
              if(err){
                return void res.send('wrong loading');
              }else{

                fs.writeFile(target_path, data, function (err) {
                  if(err){
                    console.log(err);
                    return void res.send("worng on writing");

                  }
                  else{ 

    

         
                   var uid1=req.session.uid;
                    var query = "SELECT * FROM refer WHERE uid = ? ";
                    con.query(query,[uid1],function (err,results){
                    if(err){
                      console.log(err);
                      return void res.send("somthing went wrong00");
                    }
                    else{
                      if(results.length>0){
            
                       
                        var refercode1=results[0].refercode;
                        req.session.refercode11=refercode1;
             

                      
                    
                    
              var smtpTransport= nodemailer.createTransport({// email sending
                        service:"Gmail",
                        auth:{
                          user:"nidhunlastday@gmail.com",
                          pass:"8123361328"
                        }
                      });
                       var mailOptions = {
                        from:'nidhunlastday@gmail.com',
                        to:member,
                        subject:'hai its a test',
                        text:'this is your code',
                        html:'<a href="http://localhost:3000">Please click here to signup nidhunpage,Referal code=</a>'+refercode1+''


                       };
                      smtpTransport.sendMail(mailOptions,function (err,results){
                        if(err){
                    
                        return void res.send("Something went wrong");
                        }else{
                        
                          return void res.send("invited one friend");;
                      
                        }

                      });
                        }//
                    }//
                   });//
                    


                  
                  }
                });
            }
        });
        //return void res.send("inserted");

      }
      });
    }

});
  
}
}
})

});
module.exports = router;


