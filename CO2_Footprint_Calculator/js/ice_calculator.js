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
  traffic: {
    congestion: "30%",
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

// Parse the JSON file of the car data
let carUrl =
  "https://minhtran0610.github.io/car_databases/data/car_data_2.json";
let carRequest = new XMLHttpRequest();
carRequest.responseType = "json";
carRequest.open("GET", carUrl);

carRequest.onload = () => {
  let cars = carRequest.response;

  // Get the different input and data fields:
  const makerInput = document.getElementById("inputMake");
  const modelInput = document.getElementById("inputModel");
  const versionInput = document.getElementById("inputVersion");
  const yearInput = document.getElementById("inputYear");

  const myCarMakerOptions = document.getElementById("carMakerOptions");
  const myCarModelOptions = document.getElementById("carModelOptions");
  const myCarVersionOptions = document.getElementById("carVersionOptions");
  const myCarYearOptions = document.getElementById("carYearOptions");

  // Find the different values of the car brands and sort the data
  let brands = findDifferentValues(cars, "merkkiSelvakielinen").sort();
  createOptions(brands, myCarMakerOptions);

  makerInput.onchange = function () {
    // Empty the next fields
    emtyInputAndDatalist(modelInput, myCarModelOptions);
    emtyInputAndDatalist(versionInput, myCarVersionOptions);
    emtyInputAndDatalist(yearInput, myCarYearOptions);

    // Activate the next field
    modelInput.disabled = false;

    // Get the values from the input fields and sort the data accordingly
    let maker = makerInput.value;
    let carMakerFiltered = cars.filter((car) => {
      return car.merkkiSelvakielinen === maker;
    });

    // Create the options for the input field
    let models = findDifferentValues(
      carMakerFiltered,
      "kaupallinenNimi"
    ).sort();
    createOptions(models, myCarModelOptions);
  };

  modelInput.onchange = function () {
    // Empty the next fields
    emtyInputAndDatalist(versionInput, myCarVersionOptions);
    emtyInputAndDatalist(yearInput, myCarYearOptions);

    // Activate the next field
    versionInput.disabled = false;

    // Get the values from the input fields and sort the data accordingly
    let maker = makerInput.value;
    let model = modelInput.value;
    let carModelFiltered = cars.filter((car) => {
      return car.merkkiSelvakielinen === maker && car.kaupallinenNimi === model;
    });

    // Create the options for the input field
    let versions = findDifferentValues(
      carModelFiltered,
      "mallimerkinta"
    ).sort();
    createOptions(versions, myCarVersionOptions);
  };

  versionInput.onchange = function () {
    // Empty the next fields
    emtyInputAndDatalist(yearInput, myCarYearOptions);

    // Activate the next field
    yearInput.disabled = false;

    // Create the options for the input field
    let maker = makerInput.value;
    let model = modelInput.value;
    let version = versionInput.value;
    let carVersionFiltered = cars.filter((car) => {
      return (
        car.merkkiSelvakielinen === maker &&
        car.kaupallinenNimi === model &&
        car.mallimerkinta === version
      );
    });

    // Create the options for the input field
    let years = findDifferentValues(
      carVersionFiltered,
      "ensirekisterointipvm"
    ).sort();
    createOptions(years, myCarYearOptions);
  };

  yearInput.onchange = function () {
    // Get the values from the input fields
    let maker = makerInput.value;
    let model = modelInput.value;
    let version = versionInput.value;
    let year = yearInput.value;

    // Filter the database accordingly
    let carFilter = cars.filter((car) => {
      return (
        car.merkkiSelvakielinen === maker &&
        car.kaupallinenNimi === model &&
        car.mallimerkinta === version &&
        car.ensirekisterointipvm === year
      );
    });

    // Update the car average emission
    let carAverageEmission = carFilter[0].Co2;
    if (carAverageEmission != "") {
      document.getElementById(
        "average_emission_result"
      ).textContent = `${carAverageEmission}g/km`;
    }
  };
};

carRequest.send();

// Get and process the trip data from Google Maps
// Get the input fields
const originInput = document.getElementById("inputOrigin");
const destinationInput = document.getElementById("inputDestination");

// Get the weather buttons
const manualTemperatureButton = document.getElementById("manualWeatherButton");
const realtimeTemperatureButton = document.getElementById(
  "realtimeWeatherButton"
);

function initMap() {
  // Create the Autocomplete elements for the inputs of Origin and Destination
  const options = {
    field: ["name", "formatted_address"],
  };

  const originAutocomplete = new google.maps.places.Autocomplete(
    originInput,
    options
  );
  const destinationAutocomplete = new google.maps.places.Autocomplete(
    destinationInput,
    options
  );
}

// Enable the Destination input field when the Origin field is completed
originInput.onchange = () => {
  destinationInput.disabled = false;
};

// Calculate the trip distance and update it to the GUI
destinationInput.onchange = () => {
  // First, enable the weather buttons
  manualTemperatureButton.disabled = false;
  realtimeTemperatureButton.disabled = false;

  // Calculate trip distance
  let getPlaces = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let places = [originInput.value, destinationInput.value];
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
        document.getElementById(
          "trip_distance_result"
        ).textContent = `${distance}km`;
        document.getElementById(
          "trip_duration_result"
        ).textContent = `${durationInHours}h`;
      } catch (err) {
        alert("Cannot find the trip. Please try again!");
      }
    }
  };

  calculateDistance();
};

// Adding the temperature according to the user's preference
// If the user wants to add real-time temperature
realtimeTemperatureButton.onclick = async () => {
  let geocoder = new google.maps.Geocoder();
  geocoder.geocode(
    {
      address: originInput.value,
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

// If the user wants to manually enter the temperature
const manualTemperatureOkButton = document.getElementById(
  "manualTemperatureOkButton"
);
const inputTemperatureForm = document.getElementById("inputTemperatureForm");

manualTemperatureOkButton.onclick = () => {
  const temperature = inputTemperatureForm.value;
  const temperatureTextResult = document.getElementById(
    "temperatureResultText"
  );
  const temperatureResult = document.getElementById("temperature_result");

  if (temperature === "") {
    temperatureTextResult.textContent = "";
    temperatureResult.textContent = "";
  } else {
    temperatureTextResult.textContent = `The temperature is ${temperature} degrees Celsius`;
    temperatureResult.textContent = `${temperature}\u00B0C`;
  }
};

// Calculate the total emission when clicking the button
// Get the button element
const okButton = document.getElementById("ok_button");
okButton.onclick = () => {
  // Get the values from the result elements
  let averageEmission = parseFloat(
    document.getElementById("average_emission_result").textContent
  );
  let tripDistance = parseFloat(
    document.getElementById("trip_distance_result").textContent
  );
  let tripDuration = parseFloat(
    document.getElementById("trip_duration_result").textContent
  );
  let temperature = parseFloat(
    document.getElementById("temperature_result").textContent
  );

  // Combining the car data and trip data first
  let totalEmission = averageEmission * tripDistance;

  // Check if sufficient data is provided
  if (isNaN(totalEmission)) {
    alert("Enter the information of the car and the trip first!");
    return;
  }

  // If only the car and trip data is provided, don't process the weather
  if (!isNaN(temperature)) {
    // Get the figures related to the input from the object of environmental effect
    let increaseInTemperature = getIncreaseInTemperature(
      temperature,
      ENVIRONMENT_EFFECT
    );
    let acFuelUsage = getAcFuelUsage(temperature, ENVIRONMENT_EFFECT);

    // Update the corresponding values to the GUI
    const weatherEffects = document.getElementById("weatherEffects");
    weatherEffects.innerHTML = "";

    let temperatureStatement = document.createElement("p");
    temperatureStatement.textContent = `At ${temperature} degrees Celsius:`;
    weatherEffects.appendChild(temperatureStatement);

    let effects = [
      `The real emission will change ${increaseInTemperature}% compared to official test
    values.`,
      `The AC working will result in the consumption of ${acFuelUsage} litres
    of fuel per hour.`,
      `One litre of fuel corresponds to 2350 grams of CO2.`,
    ];
    let weatherEffectsList = document.createElement("ul");
    effects.forEach((effect) => {
      let li = document.createElement("li");
      li.appendChild(document.createTextNode(effect));
      weatherEffectsList.appendChild(li);
    });

    weatherEffects.appendChild(weatherEffectsList);

    let clickHere = document.createElement("p");
    clickHere.textContent =
      "Click here to see how the effects of temperature is evaluated";
    weatherEffects.appendChild(clickHere);

    // Calculate the total emission accordingly to the numbers we have obtained
    totalEmission =
      averageEmission * tripDistance * (1 + increaseInTemperature) +
      acFuelUsage * tripDuration * 2350;
  } else {
    // Updata the corresponding values to the GUI
    document.getElementById("weatherEffects").innerHTML = "";
  }

  const textResult = document.getElementById("total_emission_result");
  textResult.textContent = `The total emission of the trip: ${Math.round(totalEmission * 100) / 100
    } grams of CO2`;
};

// Additional functions
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
function emtyInputAndDatalist(input, datalist) {
  datalist.innerHTML = "";
  input.value = "";
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
  const temperatureResult = document.getElementById("temperature_result");

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

// Get the temperature and check the percentage of the change of emission according to the values
// provided in the object of effect of the environment
function getIncreaseInTemperature(temperature, ENVIRONMENT_EFFECT) {
  const dataPoints = Object.keys(ENVIRONMENT_EFFECT.temperature);

  const intDataPoints = [];
  dataPoints.forEach((dataPoint) => {
    intDataPoints.push(parseInt(dataPoint));
  });

  closestDataPoint = findClosest(intDataPoints, temperature);
  return ENVIRONMENT_EFFECT.temperature[closestDataPoint];
}

// Check the effect of AC working during the trip according to the temperature and
// and the values according to the object of environmental effect
function getAcFuelUsage(temperature, ENVIRONMENT_EFFECT) {
  const dataPoints = Object.keys(ENVIRONMENT_EFFECT.AC);

  closestDataPoint = findClosest(dataPoints, temperature);
  return ENVIRONMENT_EFFECT.AC[closestDataPoint];
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
