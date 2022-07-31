// Effects of the environment on the trip
const EV_ENVIRONMENT_EFFECT = {
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

const ICEV_ENVIRONMENT_EFFECT = {
  temperature: {
    "-7": 0.16,
    0: 0.11,
    10: 0.05,
    20: 0,
    30: -0.02,
  },
  AC: {
    20: 0,
    21: 0.04,
    22: 0.08,
    23: 0.12,
    24: 0.16,
    25: 0.2,
    26: 0.24,
    27: 0.28,
    28: 0.32,
    29: 0.36,
    30: 0.4,
  },
};

// Main program
// Get the information of the cars from the user and process it
const inputMake_1 = document.getElementById("input_make_1");
const inputMake_2 = document.getElementById("input_make_2");
const inputModel_1 = document.getElementById("input_model_1");
const inputModel_2 = document.getElementById("input_model_2");
const inputVersion_1 = document.getElementById("input_version_1");
const inputYear_1 = document.getElementById("input_year_1");

const carMakeOptions_1 = document.getElementById("car_make_options_1");
const carMakeOptions_2 = document.getElementById("car_make_options_2");
const carModelOptions_1 = document.getElementById("car_model_options_1");
const carModelOptions_2 = document.getElementById("car_model_options_2");
const carVersionOptions_1 = document.getElementById("car_version_options_1");
const carYearOptions_1 = document.getElementById("car_year_options_1");

const averageEmissionElement = document.getElementById("average_emission");
const efficiencyElement = document.getElementById("efficiency");

getICEVInformation(
  inputMake_1,
  inputModel_1,
  inputVersion_1,
  inputYear_1,
  carMakeOptions_1,
  carModelOptions_1,
  carVersionOptions_1,
  carYearOptions_1,
  averageEmissionElement
);
getEVInformation(
  inputMake_2,
  inputModel_2,
  carMakeOptions_2,
  carModelOptions_2,
  efficiencyElement
);

// Get the distance from Google Maps and realtime temperature from AccuWeather
const inputOrigin_1 = document.getElementById("input_origin_1");
const inputOrigin_2 = document.getElementById("input_origin_2");
const inputDestination_1 = document.getElementById("input_destination_1");
const inputDestination_2 = document.getElementById("input_destination_2");

const distanceElement_1 = document.getElementById("distance_1");
const distanceElement_2 = document.getElementById("distance_2");
const temperatureElement_1 = document.getElementById("temperature_statement_1");
const temperatureElement_2 = document.getElementById("temperature_statement_2");
const travelTimeElement = document.getElementById("travel_time");

getDistanceTravelTimeAndTemperatureICEV(
  inputOrigin_1,
  inputDestination_1,
  distanceElement_1,
  travelTimeElement,
  temperatureElement_1
);
getDistanceAndTemperatureEV(
  inputOrigin_2,
  inputDestination_2,
  distanceElement_2,
  temperatureElement_2
);

// Get the emission factor from Fingrid
const emissionFactorElement = document.getElementById("emission_factor");
let emissionFactor = 0;
getEmissionFactor(emissionFactorElement);

// Process the figures and compare the results
const okButton = document.getElementById("ok_button");
okButton.onclick = () => {
  // The figures obtained from the data sources
  let averageEmission = parseFloat(averageEmissionElement.textContent);
  let travelTime = parseFloat(travelTimeElement.textContent);
  let distance_1 = parseFloat(distanceElement_1.textContent);
  let temperature_1 = parseFloat(
    temperatureElement_1.textContent.slice(41, 45)
  );

  let efficiency = parseFloat(efficiencyElement.textContent);
  let distance_2 = parseFloat(distanceElement_2.textContent);
  let temperature_2 = parseFloat(
    temperatureElement_2.textContent.slice(41, 45)
  );

  // Calculate the total emission and print it to the GUI
  const totalEmissionElement_1 = document.getElementById("total_emission_1");
  const totalEmissionElement_2 = document.getElementById("total_emission_2");

  let totalEmission_1 = calculateICEVEmission(
    averageEmission,
    distance_1,
    temperature_1,
    travelTime,
    totalEmissionElement_1
  );
  // console.log(efficiency, distance_2, temperature_2, emissionFactor);
  let totalEmission_2 = calculateEVEmission(
    efficiency,
    distance_2,
    temperature_2,
    emissionFactor,
    totalEmissionElement_2
  );

  // Compare the results
  checkSmallerValue(
    totalEmissionElement_1,
    totalEmissionElement_2,
    totalEmission_1,
    totalEmission_2
  );
};

// Necessary functions
// Retrieve the car data
async function fetchCarData(url) {
  try {
    let response = await fetch(url);
    if (response.ok) {
      let jsonResponse = await response.json();
      return jsonResponse;
    }
  } catch (err) {
    alert("Cannot retrieve car data");
  }
}

// Using the input fields to process the internal combustion engine car data
async function getICEVInformation(
  inputMake,
  inputModel,
  inputVersion,
  inputYear,
  carMakeOptions,
  carModelOptions,
  carVersionOptions,
  carYearOptions,
  emissionElement
) {
  // Fetch the database
  const carDatabase = await fetchCarData(
    "https://minhtran0610.github.io/car_databases/data/car_data_2.json"
  );

  // Create a datalist for the car make input
  finishDatalist(carDatabase, "merkkiSelvakielinen", carMakeOptions);

  // When the car make input has changed, process the next input field
  inputMake.onchange = () => {
    // Empty the next field
    emptyInputAndDatalist(inputModel, carModelOptions);
    emptyInputAndDatalist(inputVersion, carVersionOptions);
    emptyInputAndDatalist(inputYear, carYearOptions);
    inputModel.disabled = false;

    // Filter the database
    let make = inputMake.value;
    let carMakeFiltered = carDatabase.filter((car) => {
      return car.merkkiSelvakielinen === make;
    });

    // Create a datalist for the car model input
    finishDatalist(carMakeFiltered, "kaupallinenNimi", carModelOptions);
  };

  // When the car model input has changed, process the next input field
  inputModel.onchange = () => {
    emptyInputAndDatalist(inputVersion, carVersionOptions);
    emptyInputAndDatalist(inputYear, carYearOptions);
    inputVersion.disabled = false;

    // Filter the database
    let make = inputMake.value;
    let model = inputModel.value;
    let carModelFiltered = carDatabase.filter((car) => {
      return car.merkkiSelvakielinen === make && car.kaupallinenNimi === model;
    });

    // Create a datalist for the car version input
    finishDatalist(carModelFiltered, "mallimerkinta", carVersionOptions);
  };

  // When the car version input has changed, process the next input field
  inputVersion.onchange = () => {
    emptyInputAndDatalist(inputYear, carYearOptions);
    inputYear.disabled = false;

    // Filter the database
    let make = inputMake.value;
    let model = inputModel.value;
    let version = inputVersion.value;
    let carVersionFiltered = carDatabase.filter((car) => {
      return (
        car.merkkiSelvakielinen === make &&
        car.kaupallinenNimi === model &&
        car.mallimerkinta === version
      );
    });

    // Create a datalist for the car year input
    finishDatalist(carVersionFiltered, "ensirekisterointipvm", carYearOptions);
  };

  // When the car year input has changed, get the average emission of the car
  inputYear.onchange = () => {
    let make = inputMake.value;
    let model = inputModel.value;
    let version = inputVersion.value;
    let year = inputYear.value;

    let chosenCar = carDatabase.filter((car) => {
      return (
        car.merkkiSelvakielinen === make &&
        car.kaupallinenNimi == model &&
        car.mallimerkinta === version &&
        car.ensirekisterointipvm === year
      );
    });

    emissionElement.textContent = `${chosenCar[0].Co2} gCO2/km`;
  };
}

// Using the input fields to process the electric vehicle data
async function getEVInformation(
  inputMake,
  inputModel,
  carMakerOptions,
  carModelOptions,
  efficiencyElement
) {
  // Fetch the data
  const carDatabase = await fetchCarData(
    "https://minhtran0610.github.io/car_databases/data/ev_data.json"
  );

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

// Get the distance, travel time and temperature from Google Maps and AccuWeather (ICEV)
async function getDistanceTravelTimeAndTemperatureICEV(
  inputOrigin,
  inputDestination,
  distanceResult,
  travelTimeResult,
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
        const durationInHours =
          Math.round(
            response.rows["0"].elements["0"].duration_in_traffic.value / 36
          ) / 100;
        const distance =
          Math.round(response.rows["0"].elements["0"].distance.value / 100) /
          10;
        // Update the results
        distanceResult.textContent = `${distance}km`;
        travelTimeResult.textContent = `${durationInHours}h`;
      } catch (err) {
        alert("Cannot find the trip. Please try again!");
      }
    }

    calculateDistance();
    getRealtimeTemperature(inputOrigin, temperatureTextResult);
  };
}

// Get the distance and travel time from Google Maps and AccuWeather (EV)
async function getDistanceAndTemperatureEV(
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

// Get the temperature and check the percentage of the change of emission according to the values
// provided in the object of effect of the environment (ICEV)
function getIncreaseInTemperature(temperature, environmentEffect) {
  const dataPoints = Object.keys(environmentEffect.temperature);

  const intDataPoints = [];
  dataPoints.forEach((dataPoint) => {
    intDataPoints.push(parseInt(dataPoint));
  });

  closestDataPoint = findClosest(intDataPoints, temperature);
  return environmentEffect.temperature[closestDataPoint];
}

// Check the effect of AC working during the trip according to the temperature and
// and the values according to the object of environmental effect (ICEV)
function getAcFuelUsage(temperature, environmentEffect) {
  const dataPoints = Object.keys(environmentEffect.AC);

  closestDataPoint = findClosest(dataPoints, temperature);
  return environmentEffect.AC[closestDataPoint];
}

// Get the percentage of range changed according to the temperature (EV)
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

// Calculate the total emission (ICEV)
function calculateICEVEmission(
  averageEmission,
  distance,
  temperature,
  travelTime,
  totalEmissionElement
) {
  let totalEmission = Math.round(averageEmission * distance * 100) / 100;
  if (isNaN(totalEmission)) {
    alert("Enter the information of the car and the trip first!");
    return;
  }

  let increaseInTemperature = getIncreaseInTemperature(
    temperature,
    ICEV_ENVIRONMENT_EFFECT
  );
  let acFuelUsage = getAcFuelUsage(temperature, ICEV_ENVIRONMENT_EFFECT);
  totalEmission =
    Math.round(
      (totalEmission * (1 + increaseInTemperature) +
        2350 * acFuelUsage * travelTime) *
      100
    ) / 100;

  totalEmissionElement.textContent = `${totalEmission} gCO2`;
  return totalEmission;
}

// Calculate the total emission (EV)
function calculateEVEmission(
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
    EV_ENVIRONMENT_EFFECT
  );
  totalEmission = Math.round(totalEmission * efficiencyPercentage) / 100;

  totalEmissionElement.textContent = `${totalEmission} gCO2`;
  return totalEmission;
}
