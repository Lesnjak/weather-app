const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const routes = require("./routes");
const staticAsset = require("static-asset");
const mongoose = require("mongoose");
const config = require("./config");
const session = require('express-session');
const axios = require('axios');
const moment = require('moment');
const models = require('./models');




const MongoStore = require('connect-mongo')(session);
//database
const options = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
};
//express
const app = express();

app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
      mongooseConnection: mongoose.connection
    })
  })
);


mongoose.Promise = global.Promise;
mongoose.set("debug", config.IS_PRODUCTION);

mongoose.connection
  .on("error", error => console.log(error))
  .on("close", () => console.log("database connection closed"))
  .once("open", () => {
    const info = mongoose.connections[0];
    console.log(`Connected to ${info.host}:${info.port}/${info.name}`);

  });

mongoose.connect(config.MONGO_URL, options);


//sets & users
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(staticAsset(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use("/javascripts", express.static(path.join(__dirname, "node_modules", "jquery", "dist")));


app.get("/", (req, res) => {
  const id = req.session.userId;
  const name = req.session.userName;
  res.render("index.ejs",{
    user:{
      id,
      name,
    }
  });
});



app.post("/", (req, res) => {
  const id = req.session.userId;
  const name = req.session.userName;

  const {latitude,longitude} = req.body;
  if(latitude && longitude){
    const arr = [];
    arr.push(axios.get(`https://api.openweathermap.org/data/2.5/forecast/?lat=${latitude}&lon=${longitude}&units=metric&APPID=dec3d7133ca0acf04b917fde1332400b` ).then((response) => {
      const newList = response.data.list.reduce((arr,list)=>{
        if(arr[moment.unix(list.dt).format("DD-MM")]){
          arr[moment.unix(list.dt).format("DD-MM")].push(list)
        }else{
          arr[moment.unix(list.dt).format("DD-MM")] = [];
        }
        return arr
      },{})
       response.data.list = newList
      return response.data
    }).catch((err)=>{
      console.log('errerrerrerrerrerrerrerr',err);

    }))
    arr.push(axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&APPID=dec3d7133ca0acf04b917fde1332400b` ).then((response) => {
      return axios.get(`https://api.unsplash.com/search/photos/?query=${response.data.name}&client_id=2c5fff43af1e4f9973474274bfe64344b31a356937cc32f301564aa0c671e9e9` ).then((res) => {
        const imageResult = res.data.results.map(({urls})=> urls.small)
        return {
          weather:response.data,
          images:imageResult
        }
      }).catch((err)=>{
        console.log('errerrerrerrerrerrerrerr',err);
      })
    }).catch((err)=>{
      console.log('errerrerrerrerrerrerrerr',err);
    }))
    Promise.all(arr).then((response)=>{
      res.render("weather.ejs",{
        weatherList: response[0],
        currentWeather:response[1],
        moment
      });
      // res.send(response)
    })
  }
});

app.get("/weather", (req, res) => {
  const id = req.session.userId;
  const name = req.session.userName;
  res.render("weather.ejs",{
    user:{
      id,
      name,
    },
    form:{}
  });
});
app.get("/login", (req, res) => {
  const query = req.query;
  const id = req.session.userId;
  const name = req.session.userName;
  res.render("login.ejs",{
    user:{
      id:query.id || id,
      name: query.name || name,
    },
    form:{
      fields: query.fields || [],
      error: query.error || undefined,
      body: query.body || {}
    }
  });
});
app.get("/registration", (req, res) => {
  const id = req.session.userId;
  const email = req.session.userName;
  res.render("registration.ejs",{
    user:{
      id,
      email,
    },
    form:{}
  });
});

app.use("/", routes.auth);
app.use("/", routes.userWeatherList);


app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((error, req, res) => {
  res.status(error.status || 500);
  res.render("error", {
    message: error.message,
    error: !config.IS_PRODUCTION ? error : {}
  });
});

app.listen(config.PORT, () => console.log("localhost:3000 is listening"));


module.exports = app;
