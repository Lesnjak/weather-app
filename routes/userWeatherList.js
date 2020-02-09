const express = require('express');
const router = express.Router();
const axios = require('axios');
const models = require('../models');
const moment = require('moment');

router.get("/admin/:name", (req, res) => {
    const id = req.session.userId;
    const name = req.session.userName;
    models.UserWeatherList.find({owner:id,nameCity:req.params.name}).then((result)=>{
        const newList = result[0].weatherList.list.reduce((arr,list)=>{
            if(arr[moment.unix(list.dt).format("DD-MM")]){
                arr[moment.unix(list.dt).format("DD-MM")].push(list)
            }else{
                arr[moment.unix(list.dt).format("DD-MM")] = [];
            }
            return arr
        },{})
        result[0].weatherList.list = newList
        res.render("weatherCity.ejs",{
            user:{
                id,
                name,
            },
            weatherList:result[0],
            moment
        });
        // res.send(result[0])
    })

})

router.get("/admin", (req, res) => {
    const id = req.session.userId;
    const name = req.session.userName;
    models.UserWeatherList.find({owner:id}).then((result)=>{
        res.render("admin.ejs",{
            user:{
                id,
                name,
            },
            weatherList:result,
            error:''
        });
    })


});
router.post("/admin", (req, res, next) => {
    const userId = req.session.userId;
    const userName = req.session.userName;
    if(userId && userName){
        const {latitude,longitude} = req.body;
        if(latitude && longitude){
            const arr = [];
            arr.push(axios.get(`https://api.openweathermap.org/data/2.5/forecast/?lat=${latitude}&lon=${longitude}&units=metric&APPID=dec3d7133ca0acf04b917fde1332400b` ).then((response) => {
                return response.data
            }).catch((err)=>{
                console.log('errerrerrerrerrerrerrerr',err);

            }))
            arr.push(axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&APPID=dec3d7133ca0acf04b917fde1332400b` ).then((response) => {
                return axios.get(`https://api.unsplash.com/search/photos?&query=${response.data.name}&client_id=2c5fff43af1e4f9973474274bfe64344b31a356937cc32f301564aa0c671e9e9` ).then((res) => {
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
                const id = req.session.userId;
                const name = req.session.userName;
                   models.UserWeatherList.create({
                       weatherList:response[0],
                       cityImages:response[1].images,
                       currentWeather:response[1].weather,
                       owner:userId,
                       nameCity: response[1].weather.name.toLowerCase()
                   }).then((weatherList)=>{
                       models.UserWeatherList.find({owner:id}).then((result)=>{
                           res.render("admin.ejs",{
                               user:{
                                   id,
                                   name,
                               },
                               weatherList:result,
                               error:''

                           });
                           // res.send(result)
                       })
                   }).catch((error)=>{
                       models.UserWeatherList.find({owner:id}).then((result)=>{
                           res.render("admin.ejs",{
                               user:{
                                   id,
                                   name,
                               },
                               weatherList:result,
                               error:'Your list contains this city'

                           });
                       })
                   })
            })
        }
    }

});



module.exports = router
