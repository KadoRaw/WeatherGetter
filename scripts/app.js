const locationDiv = document.getElementById("location-div");
const clockDiv = document.getElementById("clock-div");
const searchInput = document.getElementById("search");
const searchButton = document.getElementById("searchbutton");

function renderWeatherCond(daysdata) {
  const date = new Date();

  const currentDiv =
    document.getElementById("weather-info-div").firstElementChild;
  const secondDateDiv =
    document.getElementById("forecast-3days-div").firstElementChild;
  const thirdDateDiv =
    document.getElementById("forecast-3days-div").lastElementChild;
  const otherInfosDiv = document.getElementById("otherinfos-div");

  const dataHandler = (div, day) => {
    const maxtemp = div.querySelector("#maxtempature");
    maxtemp.innerText = `Max ${
      daysdata.forecast.forecastday[day - 1].day.maxtemp_c
    }°C`;

    const mintemp = div.querySelector("#mintempature");
    mintemp.innerText = `Min ${
      daysdata.forecast.forecastday[day - 1].day.mintemp_c
    }°C`;

    const cond = div.querySelector("#condition");
    cond.innerText = `${
      daysdata.forecast.forecastday[day - 1].day.condition.text
    }`;

    const rainchance = div.querySelector("#rainchance");
    rainchance.innerText = `Chance of rain %${
      daysdata.forecast.forecastday[day - 1].day.daily_chance_of_rain
    }`;

    const sunrise = div
      .querySelector("#suntime")
      .firstElementChild.querySelector("div");
    sunrise.innerText = `${
      daysdata.forecast.forecastday[day - 1].astro.sunrise
    }`;

    const sunset = div
      .querySelector("#suntime")
      .lastElementChild.querySelector("div");
    sunset.innerText = `${daysdata.forecast.forecastday[day - 1].astro.sunset}`;

    const dayOne = div.querySelector("#date");
    dayOne.innerText = `${
      date.getDate() + day - 1
    }.${date.getMonth()}.${date.getFullYear()}`;
  };

  const infoDataHandler = (div) => {
    const windSpeed = div.querySelector("#windspeed").lastElementChild;
    windSpeed.innerText = `Wind Speed:${daysdata.current.wind_kph} kph`;
    const pressure = div.querySelector("#pressure").lastElementChild;
    pressure.innerText = `Pressure:${daysdata.current.pressure_mb}mb`;
    const humidity = div.querySelector("#humidity").lastElementChild;
    humidity.innerText = `Humidity: %${daysdata.current.humidity}`;
  };

  dataHandler(currentDiv, 1);
  dataHandler(secondDateDiv, 2);
  dataHandler(thirdDateDiv, 3);
  infoDataHandler(otherInfosDiv);
  document.getElementById("weather-info-div").style.display = "";
  document.getElementById("forecast-3days-div").style.display = "";
  document.getElementById("otherinfos-div").style.display = "";
}

const getPosition = () => {
  const promise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (success) => {
        resolve(success);
      },
      (error) => {
        reject(error);
      }
    );
  });
  return promise;
};

function renderInfos(data) {
  locationDiv.lastElementChild.textContent = data.location.region;
  setInterval(() => {
    clockDiv.lastElementChild.textContent = new Date().toLocaleTimeString();
  }, 1000);
}

async function locationHandler() {
  try {
    const userCurrentLocation = await getPosition();
    let userLatitude = userCurrentLocation.coords.latitude;
    let userLongitude = userCurrentLocation.coords.longitude;

    let requestString = `http://api.weatherapi.com/v1/forecast.json?key=759220a591384b43ad1182223221103%20&q=${userLatitude},${userLongitude}&days=3&aqi=yes&alerts=no#`;

    const fetchData = await fetch(requestString);
    const jsonData = await fetchData.json();

    renderWeatherCond(jsonData);
    renderInfos(jsonData);
  } catch (error) {}
}

async function getLocationWeather(user) {
  let requestString = `http://api.weatherapi.com/v1/forecast.json?key=759220a591384b43ad1182223221103%20&q=${user.lat},${user.lon}&days=3&aqi=yes&alerts=no#`;

  const fetchData = await fetch(requestString);
  const jsonData = await fetchData.json();

  locationDiv.lastElementChild.textContent = jsonData.location.region;
  renderWeatherCond(jsonData);
}

async function getAutoComplate(value) {
  const fetchData = await fetch(
    `http://api.weatherapi.com/v1/search.json?key=759220a591384b43ad1182223221103&q=${value}`
  );
  const jsonData = await fetchData.json();
  return jsonData;
}

async function autoComplateHandler(key) {
  const userInput = searchInput.value;
  if (userInput.length < 3) {
    if (
      key.code === "Backspace" &&
      searchInput.nextElementSibling.className == "searchBox"
    ) {
      searchInput.nextElementSibling.remove();
    }
    return;
  }

  let cities = [];

  await getAutoComplate(userInput).then((data) => {
    cities = [...data];
  });

  if (!(searchInput.nextElementSibling.className == "searchBox")) {
    const searchBox = document.createElement("div");
    searchBox.className = "searchBox";
    searchBox.innerHTML = "";
    const searchDivLeft = searchInput.offsetLeft;
    const searchDivTop = searchInput.offsetTop;
    const searchDivHeight = searchInput.clientHeight;

    const x = searchDivLeft + 5;
    const y = searchDivTop + searchDivHeight - 5;

    searchBox.style.position = "absolute";
    searchBox.style.left = x + "px";
    searchBox.style.top = y + "px";
    searchInput.insertAdjacentElement("afterend", searchBox);
  } else {
    if (cities.length == 0) {
      return;
    }
    const searchBox = searchInput.nextElementSibling;
    searchBox.innerHTML = "";
    for (const city of cities) {
      cityDiv = document.createElement("div");
      cityDiv.textContent = `${city.name},${city.region} - ${city.country}`;

      cityDiv.addEventListener("click", () => {
        const userSearchObject = {
          lat: city.lat,
          lon: city.lon,
        };
        searchBox.remove();
        getLocationWeather(userSearchObject);
      });

      searchBox.appendChild(cityDiv);
    }
  }
}

locationHandler();
searchInput.addEventListener("keyup", (key) => {
  autoComplateHandler(key);
});
