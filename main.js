// require express framework to deal with routes
const express = require("express");

// require https lib to send the data as response
const https = require("https");
let alert = require('alert'); 

// define app as express 
const app = express();

app.use(express.json());

//enable express to parse URL-encoded body i.e. info from HTML form
app.use(express.urlencoded({ extended: true }));

// require node:path to replace \ to / into dirname
// const path = require('node:path');

// Taking __dirname and turning to string so we can change /public directory
// let pathDIR = __dirname;
// let formatDIR = pathDIR.split(path.sep).join('/');
// console.log(pathDIR)
// let rootPath = formatDIR + "/public";

// define public and static folder (js and css files)
app.use(express.static("public"));

// viewsPath = formatDIR + "/views";
// setting up EJS
// app.set('views', viewsPath);
app.set('view engine', 'ejs');

// get requisition w/ express

app.get('/', (req, res) => {
    res.render('main');
});

app.post('/cities', (req, res) => {
    const citiesQtd = req.body.citiesQtd;
    // console.log(citiesQtd)
    res.render('cities', {nCity: citiesQtd});
});

app.post('/result', async (req, res) => {
    const city = req.body.city;
    let citiesArray = new Array(city.length);

    const lang = 'en';

    for (let index = 0; index < city.length; index++){
        citiesArray[index] = await weatherCity(res, city[index], lang);
    }
    // console.log(citiesArray);
    res.render('result', {newCityList: citiesArray});
});

// chosing port to the server
const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`Server started on port ${port}`)
});

const getCity = async (city, lang) => {
    const apiKey = 'be7ba56ca45f4a23aec172919221812';
    // https://api.weatherapi.com/v1/current.json?key=5de228ddae4a48de90d125904222611&q=Florianopolis&lang=en
    const urlCity = 'https://api.weatherapi.com/v1/current.json?key=' + apiKey + '&q=' + city + '&lang=' + lang;
    
    const result = new Promise((resolve, reject) => {
        https.get(urlCity, (response) => {
            console.log('Status Code: ')
            console.log(response.statusCode)

            if(response.statusCode === 400){
                alert(city + ' is not a valid city name')
            }
            else{
                response.on('data', (dataCity) => {
                    resolve(dataCity);
                });
            }
            
        });
    })
    return result;
}

const weatherCity = async (res, city, lang) => {
    const dataCity = await getCity(city, lang);
    const cityMade = makeCity(dataCity);
    function Cities(cityMade) {
        this.cityHTML = cityMade.nameCountryCity,
            this.localTimeCityHTML = cityMade.localTimeCity,
            this.descriptionCityHTML = cityMade.descriptionCity,
            this.temperatureCityHTML = cityMade.tempCity,
            this.temperatureFeelCityHTML = cityMade.tempFeelCity,
            this.humidityCityHTML = cityMade.humidityCity,
            this.windCityHTML = cityMade.windCity,
            this.windDirCityHTML = cityMade.windDirCity,
            this.iconCityHTML = cityMade.iconCity
    }
    return new Cities(cityMade); 
}

const makeCity = (dataCity) => {
    const weatherDataCity = JSON.parse(dataCity);

    const realnameCity = weatherDataCity.location.name;
    const countryCity = weatherDataCity.location.country;


    return {
        weatherDataCity,
        realnameCity,
        countryCity,
        nameCountryCity: realnameCity + ", " + countryCity,
        localTimeCity: weatherDataCity.location.localtime,
        tempCity: weatherDataCity.current.temp_c,
        tempFeelCity: weatherDataCity.current.feelslike_c,
        humidityCity: weatherDataCity.current.humidity,
        windCity: weatherDataCity.current.wind_kph,
        windDirCity: weatherDataCity.current.wind_dir,
        descriptionCity: weatherDataCity.current.condition.text,
        iconCity: weatherDataCity.current.condition.icon,
    }
}