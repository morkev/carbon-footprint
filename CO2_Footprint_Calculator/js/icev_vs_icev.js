// Database to study the effects of outside environment on CO2 emission
// Laboratory versus real-world emissions"
const ENVIRONMENT_EFFECT = {
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

// Get the car information from the user
const inputMake_1 = document.getElementById("input_make_1");
const inputMake_2 = document.getElementById("input_make_2");
const inputModel_1 = document.getElementById("input_model_1");
const inputModel_2 = document.getElementById("input_model_2");
const inputVersion_1 = document.getElementById("input_version_1");
const inputVersion_2 = document.getElementById("input_version_2");
const inputYear_1 = document.getElementById("input_year_1");
const inputYear_2 = document.getElementById("input_year_2");

const carMakeOptions_1 = document.getElementById("car_make_options_1");
const carMakeOptions_2 = document.getElementById("car_make_options_2");
const carModelOptions_1 = document.getElementById("car_model_options_1");
const carModelOptions_2 = document.getElementById("car_model_options_2");
const carVersionOptions_1 = document.getElementById("car_version_options_1");
const carVersionOptions_2 = document.getElementById("car_version_options_2");
const carYearOptions_1 = document.getElementById("car_year_options_1");
const carYearOptions_2 = document.getElementById("car_year_options_2");

const emissionElement_1 = document.getElementById("average_emission_1");
const emissionElement_2 = document.getElementById("average_emission_2");

getCarInformation(
  inputMake_1,
  inputModel_1,
  inputVersion_1,
  inputYear_1,
  carMakeOptions_1,
  carModelOptions_1,
  carVersionOptions_1,
  carYearOptions_1,
  emissionElement_1
);

getCarInformation(
  inputMake_2,
  inputModel_2,
  inputVersion_2,
  inputYear_2,
  carMakeOptions_2,
  carModelOptions_2,
  carVersionOptions_2,
  carYearOptions_2,
  emissionElement_2
);

// Get the distance and temperature
const inputOrigin_1 = document.getElementById("input_origin_1");
const inputOrigin_2 = document.getElementById("input_origin_2");
const inputDestination_1 = document.getElementById("input_destination_1");
const inputDestination_2 = document.getElementById("input_destination_2");
const distanceElement_1 = document.getElementById("distance_1");
const distanceElement_2 = document.getElementById("distance_2");
const travelTimeElement_1 = document.getElementById("travel_time_1");
const travelTimeElement_2 = document.getElementById("travel_time_2");
const temperatureStatement_1 = document.getElementById(
  "temperature_statement_1"
);
const temperatureStatement_2 = document.getElementById(
  "temperature_statement_2"
);

getDistanceAndTemperature(
  inputOrigin_1,
  inputDestination_1,
  distanceElement_1,
  travelTimeElement_1,
  temperatureStatement_1
);
getDistanceAndTemperature(
  inputOrigin_2,
  inputDestination_2,
  distanceElement_2,
  travelTimeElement_2,
  temperatureStatement_2
);

// Calculate the total emission
const okButton = document.getElementById("ok_button");
okButton.onclick = () => {
  let averageEmission_1 = parseFloat(emissionElement_1.textContent);
  let averageEmission_2 = parseFloat(emissionElement_2.textContent);
  let distance_1 = parseFloat(distanceElement_1.textContent);
  let distance_2 = parseFloat(distanceElement_2.textContent);
  let temperature_1 = parseFloat(
    temperatureStatement_1.textContent.slice(41, 45)
  );
  let temperature_2 = parseFloat(
    temperatureStatement_2.textContent.slice(41, 45)
  );
  let travelTime_1 = parseFloat(travelTimeElement_1.textContent);
  let travelTime_2 = parseFloat(travelTimeElement_2.textContent);

  const totalEmissionElement_1 = document.getElementById("emission_1");
  const totalEmissionElement_2 = document.getElementById("emission_2");

  let totalEmission_1 = calculateEmission(
    averageEmission_1,
    distance_1,
    temperature_1,
    travelTime_1,
    totalEmissionElement_1
  );
  let totalEmission_2 = calculateEmission(
    averageEmission_2,
    distance_2,
    temperature_2,
    travelTime_2,
    totalEmissionElement_2
  );

  checkSmallerValue(
    emissionElement_1,
    emissionElement_2,
    averageEmission_1,
    averageEmission_2
  );
  checkSmallerValue(
    distanceElement_1,
    distanceElement_2,
    distance_1,
    distance_2
  );
  checkSmallerValue(
    travelTimeElement_1,
    travelTimeElement_2,
    travelTime_1,
    travelTime_2
  );
  checkSmallerValue(
    totalEmissionElement_1,
    totalEmissionElement_2,
    totalEmission_1,
    totalEmission_2
  );
};

// Necessary functions
// Retrieve the car data
async function fetchCarData() {
  const url =
    "https://minhtran0610.github.io/car_databases/data/car_data_2.json";

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

// Using the input fields to process the car data
async function getCarInformation(
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

  const carDatabase = await fetchCarData();

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

// Get the distance from Google Maps
async function getDistanceAndTemperature(
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
    try {
      // console.log(response);
      let latitude = response[0].geometry.viewport.Ab.g;
      let longtitude = response[0].geometry.viewport.Ra.g;

      let locationKey = await getLocationKey(latitude, longtitude);
      getTemperature(locationKey, temperatureTextResult);
    } catch (error) {
      console.log(error);
      alert("Cannot get real-time temperature");
    }
  }
}

// Get the temperature and check the percentage of the change of emission according to the values
// provided in the object of effect of the environment
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
// and the values according to the object of environmental effect
function getAcFuelUsage(temperature, environmentEffect) {
  const dataPoints = Object.keys(environmentEffect.AC);

  closestDataPoint = findClosest(dataPoints, temperature);
  return environmentEffect.AC[closestDataPoint];
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

// Calculate the total emission
function calculateEmission(
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
    ENVIRONMENT_EFFECT
  );
  let acFuelUsage = getAcFuelUsage(temperature, ENVIRONMENT_EFFECT);
  totalEmission =
    Math.round(
      (totalEmission * (1 + increaseInTemperature) +
        2350 * acFuelUsage * travelTime) *
      100
    ) / 100;

  totalEmissionElement.textContent = `${totalEmission} gCO2`;
  return totalEmission;
}
