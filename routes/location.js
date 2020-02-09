const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { check } = require('express-validator/check');
const url = require('url');
const querystring = require('querystring');
const models = require('../models');

router.post('/', (req, res) => {
    res.render("index.ejs",{
        user:{
            id:555,
            name:"Vasya",
        }
    });
});



module.exports = router
