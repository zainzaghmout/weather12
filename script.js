document.getElementById('getWeatherBtn').addEventListener('click', getWeather);

function getWeather() {
    const city = document.getElementById('cityInput').value;
    if (city.trim() === '') {
        alert('Please enter a city name.');
        return;
    }

    const apiKey = '54e87aedb2d6551fa052da2df45273cc';
    const currentWeatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    fetch(currentWeatherApiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert('City not found. Please try again.');
                return;
            }

            const weatherIcon = getWeatherIcon(data.weather[0].icon);
            const weatherInfo = `
                <h2>${data.name}</h2>
                <i class="fas ${weatherIcon} fa-5x weather-icon"></i>
                <p>${data.main.temp}°C</p>
                <p>${data.weather[0].description}</p>
            `;
            document.getElementById('weatherInfo').innerHTML = weatherInfo;

            // Fetch 5-day forecast data
            fetch(forecastApiUrl)
                .then(response => response.json())
                .then(forecastData => {
                    const dailyForecasts = groupForecastByDay(forecastData.list);
                    const forecastDays = dailyForecasts.map(day => {
                        const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                        const temp = `${day.temp_min}°C - ${day.temp_max}°C`;
                        const icon = getWeatherIcon(day.weather.icon);
                        return `
                            <div>
                                <p>${date}</p>
                                <i class="fas ${icon} fa-2x"></i>
                                <p>${temp}</p>
                                <p>${day.weather.description}</p>
                            </div>
                        `;
                    }).join('');
                    document.getElementById('forecastDays').innerHTML = forecastDays;
                })
                .catch(error => {
                    console.error('Error fetching forecast data:', error);
                    alert('Failed to fetch forecast data. Please try again later.');
                });
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('Failed to fetch weather data. Please try again later.');
        });
}

function groupForecastByDay(list) {
    const days = {};
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (!days[day]) {
            days[day] = {
                ...item,
                temp_min: item.main.temp,
                temp_max: item.main.temp,
                weather: {
                    ...item.weather[0]
                }
            };
        } else {
            days[day].temp_min = Math.min(days[day].temp_min, item.main.temp);
            days[day].temp_max = Math.max(days[day].temp_max, item.main.temp);
        }
    });
    return Object.values(days).slice(0, 5);
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fa-sun', // clear sky day
        '01n': 'fa-moon', // clear sky night
        '02d': 'fa-cloud-sun', // few clouds day
        '02n': 'fa-cloud-moon', // few clouds night
        '03d': 'fa-cloud', // scattered clouds day
        '03n': 'fa-cloud', // scattered clouds night
        '04d': 'fa-cloud', // broken clouds day
        '04n': 'fa-cloud', // broken clouds night
        '09d': 'fa-cloud-showers-heavy', // shower rain day
        '09n': 'fa-cloud-showers-heavy', // shower rain night
        '10d': 'fa-cloud-sun-rain', // rain day
        '10n': 'fa-cloud-moon-rain', // rain night
        '11d': 'fa-bolt', // thunderstorm day
        '11n': 'fa-bolt', // thunderstorm night
        '13d': 'fa-snowflake', // snow day
        '13n': 'fa-snowflake', // snow night
        '50d': 'fa-smog', // mist day
        '50n': 'fa-smog' // mist night
    };
    return iconMap[iconCode] || 'fa-question';
}
