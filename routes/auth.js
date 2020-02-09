const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check } = require('express-validator/check');
const url = require('url');
const querystring = require('querystring');
const models = require('../models');


////registration
router.post('/registration', (req,res)=>{
  const userId = req.session.userId;
  const userName = req.session.userName;
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const nameLength = 2;
  const passwordLength = 2;
  var regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  if(!email || !password || !name){
    const fields = [];
    if(!email)fields.push('email');
    if(!password) fields.push('password');
    if(!name) fields.push('name');

    res.render("registration.ejs",{
      user:{
        id:userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: 'All fields must be filled!',
        fields
      }
    })
  }
  else if(regEmail.test(email) === false){
    res.render("registration.ejs",{
      user:{
        id: userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: 'Enter the correct mail!',
        fields: ['email'],
      }
    })
  }
  else if(password.length < passwordLength){
    res.render("registration.ejs",{
      user:{
        id:userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: `Password must be at least ${passwordLength} characters!`,
        fields: ['password'],
      }
    })
  }
  else if(name < nameLength){
    res.render("registration.ejs",{
      user:{
        id:userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: `Name must be at least ${nameLength} characters!`,
        fields: ['name'],
      }
    })
  }
  else {
    bcrypt.genSalt(10,(err,salt) => {
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          res.render("registration.ejs",{
            user:{
              id:userId,
              name: userName,
            },
            form:{
              body:req.body,
              error: `Error, try again later`,
              fields: [],
            }
          })
        }
        models.User.create({
          email,
          password: hash,
          name
        }).then(()=>{
          models.User.findOne({
            email
          }).then((user) => {
            req.session.userId = user.id;
            req.session.userName = user.name;
            res.redirect('/admin')
          })

        })
      })
    })
  }
});



////login
router.post('/login',[
  check('email', 'Your email is not valid').not().isEmpty(),
  check('password', 'Your email is not valid').not().isEmpty(),
],(req,res)=>{
  const userId = req.session.userId;
  const userName = req.session.userName;
  const email = req.body.email;
  const password = req.body.password;
  const passwordLength = 2;
  var regEmail = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

  if(!email || !password ){
    const fields = [];
    if(!email)fields.push('email');
    if(!password) fields.push('password');
    const params = {
      name:userId,
      id:userName,
      error: 'All fields must be filled!',
      fields,
      body:req.body,
    }
    res.redirect('/login?' + querystring.stringify(params))
  }
  else if(regEmail.test(email) === false){
    res.render("login.ejs",{
      user:{
        id:userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: 'Enter the correct mail!',
        fields: ['email'],
      }
    })
  }
  else if(password.length < passwordLength){
    res.render("login.ejs",{
      user:{
        id:userId,
        name: userName,
      },
      form:{
        body:req.body,
        error: `Password must be at least ${passwordLength} characters!`,
        fields: ['password'],
      }
    })
  }
  else {
    models.User.findOne({
      email
    }).then((user) => {
      if(!user){
        res.render("login.ejs",{
          user:{
            id:userId,
            name: userName,
          },
          form:{
            body:req.body,
            error: `Email or password is not correct!`,
            fields: [],
          }
        })
      }else{
        bcrypt.compare(password, user.password, function(err, result) {
          if(!result){
            res.render("login.ejs",{
              user:{
                id:userId,
                name: userName,
              },
              form:{
                error: `BD is not working`,
              }
            })
          }
          else{
            req.session.userId = user.id;
            req.session.userName = user.name;
            res.redirect('/admin')
          }
        });
      }
    })
      .catch(() =>{
        res.render("login.ejs",{
          user:{
            id:userId,
            name: userName,
          },
          form:{
            body:req.body,
            error: `Error, try again later.`,
          }
        })

      })
  }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    // delete session object
    req.session.destroy(() => {
      res.redirect('/');
    });
  } else {
    res.redirect('/');
  }
});

module.exports = router
