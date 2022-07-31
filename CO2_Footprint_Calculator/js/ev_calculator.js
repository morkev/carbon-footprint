// Effect of the environment on the trip
const ENVIRONMENT_EFFECT = {
  temperature: {
    "-20": 50,
    "-10": 60,
    0: 80,
    10: 100,
    20: 115,
    30: 105,
    40: 80,
  },
};

// Main program
// Get the information of electric vehicle
getEVInformation();

// Get the trip information from Google Maps
// Get the input fields and the weather buttons
const inputOrigin = document.getElementById("inputOrigin");
const inputDestination = document.getElementById("inputDestination");
const manualWeatherButton = document.getElementById("manualWeatherButton");
const realtimeWeatherButton = document.getElementById("realtimeWeatherButton");

// Callback function to create the Autocomplete fields
function initMap() {
  // Create the Autocomplete elements for the inputs of Origin and Destination
  const options = {
    field: ["name", "formatted_address"],
  };
  const originAutocomplete = new google.maps.places.Autocomplete(
    inputOrigin,
    options
  );
  const destinationAutocomplete = new google.maps.places.Autocomplete(
    inputDestination,
    options
  );
}

getDistance(
  inputOrigin,
  inputDestination,
  manualWeatherButton,
  realtimeWeatherButton
);

// Get the emission factor from Fingrid
getEmissionFactor();

// Get the temperature from the user
getTemperatureUser(realtimeWeatherButton);

// Calculate the total emission
calculateEmission();

// Necessary functions
// Retrieve the car data
async function fetchEVData() {
  const url = "https://minhtran0610.github.io/car_databases/data/ev_data.json";

  try {
    let response = await fetch(url);
    if (response.ok) {
      let jsonResponse = await response.json();
      return jsonResponse;
    }
  } catch (err) {
    console.log(err);
  }
}

// Using the input fields to process the car data
async function getEVInformation() {
  // Get the input and datalist fields
  const inputMake = document.getElementById("inputMake");
  const inputModel = document.getElementById("inputModel");

  const carMakerOptions = document.getElementById("carMakerOptions");
  const carModelOptions = document.getElementById("carModelOptions");

  // Fetch the data
  const carDatabase = await fetchEVData();

  // The events of the input fields
  // Create a datalist for the car maker input
  finishDatalist(carDatabase, "brand", carMakerOptions);

  // When the car maker input is changed, process the next input field
  inputMake.onchange = () => {
    // Empty the next field
    emptyInputAndDatalist(inputModel, carModelOptions);
    inputModel.disabled = false;

    // Filter the database
    let make = inputMake.value;
    let carMakerFiltered = carDatabase.filter((car) => {
      return car.brand === make;
    });
    // Create a datalist for the car model input
    finishDatalist(carMakerFiltered, "model", carModelOptions);
  };

  inputModel.onchange = () => {
    // Get the inputs and filter the database
    let make = inputMake.value;
    let model = inputModel.value;

    let EV = carDatabase.filter((car) => {
      return car.brand === make && car.model === model;
    });

    // Update the result to the GUI
    document.getElementById(
      "efficiency"
    ).textContent = `${EV[0].efficiency} Wh/km`;
  };
}

// Create a list of options for an input field
function createOptions(optionsArray, datalistElement) {
  optionsArray.forEach((option) => {
    const myOption = document.createElement("option");
    myOption.value = option;
    datalistElement.appendChild(myOption);
  });
}

// Find the different values of a field in the data
function findDifferentValues(obj, field) {
  let results = [];
  obj.forEach((entry) => {
    if (!results.includes(entry[field])) {
      results.push(entry[field]);
    }
  });
  return results;
}

// Empty the input field and its options
function emptyInputAndDatalist(input, datalist) {
  datalist.innerHTML = "";
  input.value = "";
}

// Create datalist for an input field
function finishDatalist(obj, field, datalistElement) {
  let option = findDifferentValues(obj, field).sort();
  createOptions(option, datalistElement);
}

// Get the distance from Google Maps
async function getDistance(
  inputOrigin,
  inputDestination,
  manualWeatherButton,
  realtimeWeatherButton
) {
  inputOrigin.onchange = () => {
    inputDestination.disabled = false;
  };

  inputDestination.onchange = () => {
    // Enable the weather buttons
    manualWeatherButton.disabled = false;
    realtimeWeatherButton.disabled = false;

    // Calculate trip distance
    let getPlaces = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          let places = [inputOrigin.value, inputDestination.value];
          resolve(places);
        }, 100);
      });
    };

    let calculateDistance = async () => {
      let places = await getPlaces();

      let service = new google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [places[0]],
          destinations: [places[1]],
          travelMode: "DRIVING",
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: "bestguess",
          },
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        callback
      );
    };

    function callback(response) {
      try {
        const durationInHours =
          Math.round(
            response.rows["0"].elements["0"].duration_in_traffic.value / 36
          ) / 100;
        const distance =
          Math.round(response.rows["0"].elements["0"].distance.value / 100) /
          10;

        // Update the results
        document.getElementById("distance").textContent = `${distance}km`;
        document.getElementById("time").textContent = `${durationInHours}h`;
      } catch (err) {
        alert("Cannot find the trip. Please try again!");
      }
    }

    calculateDistance();
  };
}

// Retrieve the emission factor information from Fingrid
async function fetchFingridData() {
  const url = "https://api.fingrid.fi/v1/variable/265/event/json";
  const header = {
    "x-api-key": "0F7Lvj4uQT9qjVQzs23SH57x0ynbM8AB8hrHpaWe",
  };

  try {
    let response = await fetch(url, {
      headers: header,
    });
    if (response.ok) {
      let jsonResponse = response.json();
      return jsonResponse;
    }
  } catch (err) {
    console.log(err);
  }
}

// Process the time strings provided by Fingrid
function processTimeString(timeString) {
  let timeParts = timeString.split("T");
  timeParts[1] = timeParts[1].slice(0, 8);

  return `${timeParts[0]}, ${timeParts[1]}, GMT+0`;
}

// Get the emission figure and update to the GUI
async function getEmissionFactor() {
  let response = await fetchFingridData();

  // Update to the GUI
  document.getElementById("co2Result").textContent =
    `The emission per 1kWh consumed, updated on ${processTimeString(
      response.start_time
    )}` + `, is ${response.value} gCO2/kWh.`;
  document.getElementById(
    "emission"
  ).textContent = `${response.value} gCO2/kWh`;
}

// Get the location key from AccuWeather
async function getLocationKey(latitude, longtitude) {
  let url = `https://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apikey=Hy1GOAded2vMrGTDAu2bXcXRW4gjGI2i&q=${latitude}%2C%20${longtitude}`;

  // Call the Locations API from AccuWeather to search for the location key
  try {
    let response = await fetch(url);
    if (response.ok) {
      let jsonResponse = await response.json();
      return jsonResponse.Key;
    }
  } catch (error) {
    console.log(error);
  }
}

// Get the current temperature of the origin from AccuWeather
async function getTemperature(locationKey) {
  // Get the elements that contains the result
  const temperatureTextResult = document.getElementById(
    "temperatureResultText"
  );
  const temperatureResult = document.getElementById("temperature");

  let url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=Hy1GOAded2vMrGTDAu2bXcXRW4gjGI2i`;

  // Call the Current Conditions API to get the weather and the temperature of the origin
  try {
    let response = await fetch(url);
    if (response.ok) {
      let jsonResponse = await response.json();
      // Update the weather and temperature of the origin on the GUI
      let temperature = jsonResponse[0].Temperature.Metric.Value;

      temperatureTextResult.textContent = `The current temperature at the origin is ${temperature} degrees Celsius`;
      temperatureResult.textContent = `${temperature}\u00B0C`;
    }
  } catch (error) {
    console.log(error);
  }
}

// Get the temperature according to the users' preferences
async function getTemperatureUser(realtimeTemperatureButton) {
  const manualTemperatureOkButton = document.getElementById(
    "manualTemperatureOkButton"
  );
  const inputTemperatureForm = document.getElementById("inputTemperatureForm");

  manualTemperatureOkButton.onclick = () => {
    const temperature = inputTemperatureForm.value;
    const temperatureTextResult = document.getElementById(
      "temperatureResultText"
    );
    const temperatureResult = document.getElementById("temperature");

    if (temperature === "") {
      temperatureTextResult.textContent = "";
      temperatureResult.textContent = "";
    } else {
      temperatureTextResult.textContent = `The temperature is ${temperature} degrees Celsius`;
      temperatureResult.textContent = `${temperature}\u00B0C`;
    }
  };

  realtimeTemperatureButton.onclick = () => {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: inputOrigin.value,
      },
      callback
    );

    async function callback(response) {
      let latitude = response[0].geometry.viewport.Ab.g;
      let longtitude = response[0].geometry.viewport.Ra.g;

      let locationKey = await getLocationKey(latitude, longtitude);
      getTemperature(locationKey);
    }
  };
}

// Find the closest number in an array to a given number
// The code snippet comes from www.codevscolor.com
function findClosest(arr, num) {
  if (arr == null) {
    return;
  }

  let closest = arr[0];
  for (let item of arr) {
    if (Math.abs(item - num) < Math.abs(closest - num)) {
      closest = item;
    }
  }
  return closest;
}

// Get the percentage of efficiency changed according to the temperature
function getEfficiencyPercentage(temperature, ENVIRONMENT_EFFECT) {
  const dataPoints = Object.keys(ENVIRONMENT_EFFECT.temperature);

  const intDataPoints = [];
  dataPoints.forEach((dataPoint) => {
    intDataPoints.push(parseInt(dataPoint));
  });

  closestDataPoint = findClosest(intDataPoints, temperature);
  return (
    Math.round(1000000 / ENVIRONMENT_EFFECT.temperature[closestDataPoint]) / 100
  );
}

// Calculate the equivalent emission
function calculateEmission() {
  const okButton = document.getElementById("okButton");

  okButton.onclick = () => {
    let efficiency = parseFloat(
      document.getElementById("efficiency").textContent
    );
    let distance = parseFloat(document.getElementById("distance").textContent);
    let emissionFactor = parseFloat(
      document.getElementById("emission").textContent
    );
    let temperature = parseFloat(
      document.getElementById("temperature").textContent
    );

    // Combining the first 3 database
    let totalEmission =
      Math.round((efficiency * distance * emissionFactor) / 10) / 100;

    // Check if enough information is given
    if (isNaN(totalEmission)) {
      alert("Enter the information of the car and the trip first!");
      return;
    }

    // If the temperature is not given, only use the 3 database. Else, combine also
    // the effect of the temperature
    const weatherEffects = document.getElementById("weatherEffects");
    weatherEffects.innerHTML = "";

    if (!isNaN(temperature)) {
      let percentage = getEfficiencyPercentage(temperature, ENVIRONMENT_EFFECT);
      // Update the numbers to the GUI
      const temperatureStatement = document.createElement("p");
      weatherEffects.inn;

      temperatureStatement.textContent =
        `At ${temperature} degrees Celsius, the real efficiency equals ` +
        `${percentage}% of test values`;
      const clickHere = document.createElement("p");
      clickHere.textContent =
        "Click here to see how the effects of temperature is evaluated";

      weatherEffects.appendChild(temperatureStatement);
      weatherEffects.appendChild(clickHere);

      // Calcualte the real emission
      totalEmission = Math.round(totalEmission * percentage) / 100;
    }

    // Show the final result
    document.getElementById(
      "totalEmissionResult"
    ).textContent = `The total emission of the trip: ${totalEmission} grams of CO2`;
  };
}
