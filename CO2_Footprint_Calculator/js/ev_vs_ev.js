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

// Global variables to store the figures obtained from the database
let efficiency_1 = 0;
let efficiency_2 = 0;
let distance_1 = 0;
let distance_2 = 0;
let temperature_1 = 0;
let temperature_2 = 0;
let emissionFactor = 0;

// Main program
// Get the necessary elements to process the car data and process it
const inputMake_1 = document.getElementById("input_make_1");
const inputMake_2 = document.getElementById("input_make_2");
const inputModel_1 = document.getElementById("input_model_1");
const inputModel_2 = document.getElementById("input_model_2");
const carMakerOptions_1 = document.getElementById("car_make_options_1");
const carMakerOptions_2 = document.getElementById("car_make_options_2");
const carModelOptions_1 = document.getElementById("car_model_options_1");
const carModelOptions_2 = document.getElementById("car_model_options_2");
const efficiencyElement_1 = document.getElementById("efficiency_1");
const efficiencyElement_2 = document.getElementById("efficiency_2");

getEVInformation(
  inputMake_1,
  inputModel_1,
  carMakerOptions_1,
  carModelOptions_1,
  efficiencyElement_1
);
getEVInformation(
  inputMake_2,
  inputModel_2,
  carMakerOptions_2,
  carModelOptions_2,
  efficiencyElement_2
);

// Get the CO2 emission factor from Fingrid
const emissionFactorField = document.getElementById("emission_factor");
getEmissionFactor(emissionFactorField);

// Get the distance Google Maps and realtime temperature from AccuWeather
const inputOrigin_1 = document.getElementById("input_origin_1");
const inputOrigin_2 = document.getElementById("input_origin_2");
const inputDestination_1 = document.getElementById("input_destination_1");
const inputDestination_2 = document.getElementById("input_destination_2");
const distanceResult_1 = document.getElementById("distance_1");
const distanceResult_2 = document.getElementById("distance_2");
const temperatureStatement_1 = document.getElementById(
  "temperature_statement_1"
);
const temperatureStatement_2 = document.getElementById(
  "temperature_statement_2"
);

getDistanceAndTemperature(
  inputOrigin_1,
  inputDestination_1,
  distanceResult_1,
  temperatureStatement_1
);
getDistanceAndTemperature(
  inputOrigin_2,
  inputDestination_2,
  distanceResult_2,
  temperatureStatement_2
);

// Process the figures and compare the results
const okButton = document.getElementById("ok_button");
okButton.onclick = () => {
  efficiency_1 = parseFloat(efficiencyElement_1.textContent);
  efficiency_2 = parseFloat(efficiencyElement_2.textContent);
  distance_1 = parseFloat(distanceResult_1.textContent);
  distance_2 = parseFloat(distanceResult_2.textContent);
  temperature_1 = parseFloat(temperatureStatement_1.textContent.slice(41, 45));
  temperature_2 = parseFloat(temperatureStatement_2.textContent.slice(41, 45));

  const totalEmissionElement_1 = document.getElementById("total_emission_1");
  const totalEmissionElement_2 = document.getElementById("total_emission_2");

  let totalEmission_1 = calculateEmission(
    efficiency_1,
    distance_1,
    temperature_1,
    emissionFactor,
    totalEmissionElement_1
  );
  let totalEmission_2 = calculateEmission(
    efficiency_2,
    distance_2,
    temperature_2,
    emissionFactor,
    totalEmissionElement_2
  );

  checkSmallerValue(
    efficiencyElement_1,
    efficiencyElement_2,
    efficiency_1,
    efficiency_2
  );
  checkSmallerValue(distanceResult_1, distanceResult_2, distance_1, distance_2);
  checkSmallerValue(
    totalEmissionElement_1,
    totalEmissionElement_2,
    totalEmission_1,
    totalEmission_2
  );
};

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
async function getEVInformation(
  inputMake,
  inputModel,
  carMakerOptions,
  carModelOptions,
  efficiencyElement
) {
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
    efficiencyElement.textContent = `${EV[0].efficiency} Wh/km`;
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

// Check which value is smaller and bold it
function checkSmallerValue(field_1, field_2, value_1, value_2) {
  value_1 = parseFloat(field_1.textContent);
  value_2 = parseFloat(field_2.textContent);

  if (value_1 < value_2) {
    field_1.style.fontWeight = "bold";
  } else if (value_1 > value_2) {
    field_2.style.fontWeight = "bold";
  }
}

// Process the time strings provided by Fingrid
function processTimeString(timeString) {
  let timeParts = timeString.split("T");
  timeParts[1] = timeParts[1].slice(0, 8);

  return `${timeParts[0]}, ${timeParts[1]}, GMT+0`;
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

// Get the emission figure and update to the GUI
async function getEmissionFactor(emissionFactorField) {
  let response = await fetchFingridData();

  // Update to the GUI
  emissionFactorField.textContent =
    `The emission per 1kWh consumed, updated on ${processTimeString(
      response.start_time
    )}` + `, is ${response.value} gCO2/kWh.`;

  emissionFactor = response.value;
}

// Callback function to create the Autocomplete fields
function initMap() {
  // Create the Autocomplete elements for the inputs of Origin and Destination
  const options = {
    field: ["name", "formatted_address"],
  };
  const origin1Autocomplete = new google.maps.places.Autocomplete(
    inputOrigin_1,
    options
  );
  const origin2Autocomplete = new google.maps.places.Autocomplete(
    inputOrigin_2,
    options
  );
  const destination1Autocomplete = new google.maps.places.Autocomplete(
    inputDestination_1,
    options
  );
  const destination2Autocomplete = new google.maps.places.Autocomplete(
    inputDestination_2,
    options
  );
}

// Get the distance from Google Maps
async function getDistanceAndTemperature(
  inputOrigin,
  inputDestination,
  distanceResult,
  temperatureTextResult
) {
  inputOrigin.onchange = () => {
    inputDestination.disabled = false;
  };

  inputDestination.onchange = () => {
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
        const distance =
          Math.round(response.rows["0"].elements["0"].distance.value / 100) /
          10;
        // Update the results
        distanceResult.textContent = `${distance}km`;
      } catch (err) {
        alert("Cannot find the trip. Please try again!");
      }
    }

    calculateDistance();
    getRealtimeTemperature(inputOrigin, temperatureTextResult);
  };
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
async function getTemperature(locationKey, temperatureTextResult) {
  let url = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=Hy1GOAded2vMrGTDAu2bXcXRW4gjGI2i`;

  // Call the Current Conditions API to get the weather and the temperature of the origin
  try {
    let response = await fetch(url);
    if (response.ok) {
      let jsonResponse = await response.json();
      // Update the weather and temperature of the origin on the GUI
      let temperature = jsonResponse[0].Temperature.Metric.Value;

      temperatureTextResult.textContent = `The current temperature at the origin is ${temperature} degrees Celsius`;
    }
  } catch (error) {
    console.log(error);
  }
}

// Get the real-time temperature
async function getRealtimeTemperature(inputOrigin, temperatureTextResult) {
  try {
    let geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      {
        address: inputOrigin.value,
      },
      callback
    );
  } catch (error) {
    alert("Cannot calculate temperature");
  }

  async function callback(response) {
    console.log(response);
    let latitude = response[0].geometry.viewport.Ab.g;
    let longtitude = response[0].geometry.viewport.Ra.g;

    let locationKey = await getLocationKey(latitude, longtitude);
    getTemperature(locationKey, temperatureTextResult);
  }
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

// Get the percentage of range changed according to the temperature
function getEfficiencyPercentage(temperature, environmentEffect) {
  const dataPoints = Object.keys(environmentEffect.temperature);

  const intDataPoints = [];
  dataPoints.forEach((dataPoint) => {
    intDataPoints.push(parseInt(dataPoint));
  });

  closestDataPoint = findClosest(intDataPoints, temperature);
  return (
    Math.round(1000000 / environmentEffect.temperature[closestDataPoint]) / 100
  );
}

// Calculate the total emission
function calculateEmission(
  efficiency,
  distance,
  temperature,
  emissionFactor,
  totalEmissionElement
) {
  let totalEmission = (efficiency * distance * emissionFactor) / 1000;
  if (isNaN(totalEmission)) {
    alert("Enter the information of the car and the trip first!");
    return;
  }

  let efficiencyPercentage = getEfficiencyPercentage(
    temperature,
    ENVIRONMENT_EFFECT
  );
  totalEmission = Math.round(totalEmission * efficiencyPercentage) / 100;

  totalEmissionElement.textContent = `${totalEmission} gCO2`;
  return totalEmission;
}
