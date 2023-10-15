import {config} from 'dotenv';
config();



// Declaration and Initialization of Variables
let city_input = document.querySelector("#txt_search_location");
let search_button = document.querySelector("#btn_search");
let current_weather_div = document.querySelector(".current_weather");
let days_forecast_div = document.querySelector(".days_forecast");

const API_KEY = process.env.WEATHER_API_KEY;

// create weather card HTML based on weather data
const createWeatherCard = (cityName, weatherItem, index) => 
{
    if(index === 0) 
    {   
        // append today's weather
        return `<div class="mt-3 d-flex">
                    <div>
                        <h3 class="fw-bold">${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h3>
                        <h6 class="my-3 mt-3">Temperature: ${((weatherItem.main.temp - 273.15).toFixed(2))}°C</h6>
                        <h6 class="my-3">Wind: ${weatherItem.wind.speed} M/S</h6>
                        <h6 class="my-3">Humidity: ${weatherItem.main.humidity}%</h6>
                    </div>
                    <div class="text-center">
                    <img class="mt-3" src="/weather_icon/${weatherItem.weather[0].icon}.png" alt="weather icon">
                        <h6>${weatherItem.weather[0].description}</h6>
                    </div>
                </div>`;
    } 
    
    else 
    {
        // append weather forecast for the next 5 days

        return `<div class="col mb-3">
                    <div class="card border-0 bg-transparent text-white">
                        <div class="card-body p-3 text-white">
                            <h5 class="card-title fw-semibold">(${weatherItem.dt_txt.split(" ")[0]})</h5>
                            <img src="/weather_icon/${weatherItem.weather[0].icon}.png" alt="weather icon">
                            <h6>${weatherItem.weather[0].description}</h6>
                            <h6 class="card-text my-3 mt-3">Temp: ${((weatherItem.main.temp - 273.15).toFixed(2))}°C</h6>
                            <h6 class="card-text my-3">Wind: ${weatherItem.wind.speed} M/S</h6>
                            <h6 class="card-text my-3">Humidity: ${weatherItem.main.humidity}%</h6>
                        </div>
                    </div>
                </div>`;
    }
}

// get weather details of passed latitude and longitude
const getWeatherDetails = (cityName, latitude, longitude) => 
{   
    // importing data from openweathermap
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => 
        {
            const forecastArray = data.list;
            const uniqueForecastDays = new Set();

            const fiveDaysForecast = forecastArray.filter(forecast => {
                const forecastDate = new Date(forecast.dt_txt).getDate();
                if (!uniqueForecastDays.has(forecastDate) && uniqueForecastDays.size < 6) 
                {
                    uniqueForecastDays.add(forecastDate);
                    return true;
                }
                return false;
        });

        city_input.value = "";
        current_weather_div.innerHTML = "";
        days_forecast_div.innerHTML = "";

        fiveDaysForecast.forEach((weatherItem, index) => 
        {
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                current_weather_div.insertAdjacentHTML("beforeend", html);
            } else {
                days_forecast_div.insertAdjacentHTML("beforeend", html);
            }
        });        
    }).catch(() => 
    {
        const coordinates_error = new bootstrap.Modal(document.querySelector('#coordinates_error'));
        return coordinates_error.show();
    });
}

// get coordinates of entered city name
const getCityCoordinates = () => 
{   
    // importing coordinates from openweathermap
    const cityName = city_input.value.trim();
    if (cityName === "") return;
    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;
  
    fetch(API_URL).then(response => response.json()).then(data => 
    {
        const invalid = new bootstrap.Modal(document.querySelector('#invalid_city_name'));
        document.querySelector('#invalid_city_name_modal_p').innerHTML = `No coordinates found for ${cityName}.`;
        if (!data.length) return invalid.show();
        const { lat, lon, name } = data[0];
        getWeatherDetails(name, lat, lon);
    }).catch(() => 
    {   
        const coordinates_error = new bootstrap.Modal(document.querySelector('#coordinates_error'));
        return coordinates_error.show();
    });
}

// condition for textbox search
search_button.addEventListener("click", () => 
    {   
        const search = new bootstrap.Modal(document.querySelector('#search'));
        if(city_input.value == "")
        {
           search.show();
        }
            
        else
        {
            getCityCoordinates();
        }
        
        city_input.value = "";
    });