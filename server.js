'use strict';

// Require depenancies used
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

//Setting port and assigning varibale for express.
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

//route to location
app.get('/location', (request, response) => {
  searchToLatLong(request.query.data)
    .then(location => response.send(location))
    .catch(error => handleError(error, response));
})

//route to weather
app.get('/weather', (request, response) => {
  const weatherData = getWeather(request.query.data);
  response.send(weatherData);
});

//Errror handler
function handleError(err, res){
  console.error(err);
  if (res) res.status(500).send('Piss Off');
}

//search lat long funciton
function searchToLatLong(query){
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  return superagent.get(url)
    .then(res=>{
      return new Location(query, res);
    })
    .catch(error => handleError);
}

//search to weatherdata
function getWeather(){
  const darkskyData = require('./data/darksky.json');
  // const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;
  let weatherSummaries = [];
  darkSkyData.daily.data.forEach(day=>{
    weatherSummaries.push(new Weather(day));
  });
  return weatherSummaries
}

//location constructor
function Location(query, res) {
  this.search_query = query;
  this.formatted_query = res.results[0].formatted_address;
  this.latitude = res.results[0].geometry.location.lat;
  this.longitude = res.results[0].geometry.location.lng;
}

//forecast constructor
function Weather(day){
  this.forecast = day.summary;
  this.time = new Date(day.time*1000).toString().slice(0,15);
}

app.use('*', (err, res) => handleError(err, res));

app.listen(PORT, () => console.log(`App is up on ${PORT}`));
