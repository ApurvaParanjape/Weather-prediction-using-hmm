const API_KEY = "f30efbbf01120d1514ff5da730215ff1"; // Replace with your API key
const BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";
const DAYS_TO_PREDICT = 5;

const weatherMapping = {
  Clear: "Sunny",
  Clouds: "Cloudy",
  Rain: "Rainy",
};

function mapWeatherDescription(description) {
  for (const key in weatherMapping) {
    if (description.toLowerCase().includes(key.toLowerCase())) {
      return weatherMapping[key];
    }
  }
  return "Cloudy";
}

function getWeatherForecast(city) {
  const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayWeather(data, city);
    })
    .catch((error) => {
      console.error("Error fetching weather data:", error);
      alert("City not found or API error.");
    });
}

function displayWeather(data, city) {
  const cityElement = document.getElementById("city");
  const currentStateElement = document.getElementById("current-state");
  const currentDescriptionElement = document.getElementById("current-description");
  const forecastDaysElement = document.getElementById("forecast-days");

  const weatherCondition = mapWeatherDescription(data.list[0].weather[0].main);
  const icon = getWeatherIcon(weatherCondition); // Get icon based on weather condition

  cityElement.textContent = city;

  // Remove the icon from the state field and only show the word
  currentStateElement.textContent = weatherCondition; // Just show the word ("Sunny", "Rainy", etc.)
  currentDescriptionElement.textContent = data.list[0].weather[0].main;

  forecastDaysElement.innerHTML = "";

  let predictedWeather = [weatherCondition];
  let lastState = predictedWeather[0];
  for (let i = 1; i <= DAYS_TO_PREDICT; i++) {
    lastState = predictNextWeatherHMM(lastState);
    predictedWeather.push(lastState);
  }

  for (let i = 1; i < predictedWeather.length; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);

    // Get the weekday (Mon, Tue, etc.)
    const options = { weekday: 'short', month: 'short', day: 'numeric' };  
    const weekdayName = futureDate.toLocaleDateString('en-US', options);

    const icon = getWeatherIcon(predictedWeather[i]); // Get icon for predicted weather

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("forecast-day");

    // Add the weather icon color
    const iconColor = getIconColor(predictedWeather[i]);

    dayDiv.innerHTML = `
      <h3>${weekdayName}</h3>
      <div class="icon-container" style="color: ${iconColor};">${icon}</div>
      <p>${predictedWeather[i]}</p>
    `;
    forecastDaysElement.appendChild(dayDiv);
  }
}


// Helper function to assign the icon color based on weather type
function getIconColor(weatherCondition) {
  switch (weatherCondition) {
    case "Sunny":
      return "yellow";
    case "Rainy":
      return "darkblue";
    case "Cloudy":
      return "grey";
    default:
      return "grey"; // Default to grey if weather condition is unknown
  }
}



function getWeatherIcon(weatherCondition) {
  if (weatherCondition === "Sunny") {
    return '<i class="fas fa-sun"></i>'; // Font Awesome Sun icon for sunny weather
  } else if (weatherCondition === "Rainy") {
    return '<i class="fas fa-cloud-showers-heavy"></i>'; // Font Awesome Rain cloud icon for rainy weather
  } else if (weatherCondition === "Cloudy") {
    return '<i class="fas fa-cloud-sun"></i>'; // Font Awesome Cloud with sun icon for cloudy weather
  }
  return ""; // Default case if no condition is matched
}

const states = ["Sunny", "Cloudy", "Rainy"];
const transitionProbs = [
  [0.6, 0.3, 0.1],
  [0.2, 0.5, 0.3],
  [0.1, 0.4, 0.5],
];

function predictNextWeatherHMM(lastState) {
  const lastStateIndex = states.indexOf(lastState);
  const nextStateProbs = transitionProbs[lastStateIndex];

  let randomNum = Math.random();
  let cumulativeProb = 0;

  for (let i = 0; i < nextStateProbs.length; i++) {
    cumulativeProb += nextStateProbs[i];
    if (randomNum < cumulativeProb) {
      return states[i];
    }
  }
  return states[nextStateProbs.length - 1];
}

// Event listener for clicking the button
document.getElementById("getWeatherButton").addEventListener("click", () => {
  const city = document.getElementById("city").value;
  if (city) {
    getWeatherForecast(city);
  } else {
    alert("Please enter a city.");
  }
});

// Allow pressing Enter key to trigger the prediction
document.getElementById("city").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    document.getElementById("getWeatherButton").click();
  }
});
