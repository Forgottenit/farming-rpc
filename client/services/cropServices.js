const { cropClient } = require("../clientInstances");
// prompt-sync module is used to get user input from the console synchronously
const prompt = require("prompt-sync")({ sigint: true });

function getWaterLevel(callback) {
  // Retrieve sensor ID from user input
  console.error("Test error output at the start of the script");
  const sensorId = prompt("Enter Sensor ID (1, 2, 3, 4 or 5): ");
  // Validate the sensor ID
  if (!sensorId || isNaN(sensorId) || sensorId < 1 || sensorId > 5) {
    callback(
      "\nInvalid Sensor ID. Please enter a sensor number between 1 and 5."
    );
    return;
  }
  // Call the GetWaterLevel RPC
  cropClient.GetWaterLevel({ sensorId }, (error, response) => {
    if (error) {
      console.error("Error fetching water level:", error);
      callback(error);
    } else {
      console.log(`\nSensor ${sensorId} Water level: ${response.level} inches`);
      callback(null, response.level);
    }
  });
}

function monitorTemperature(callback) {
  console.log("\nEnter: \n1. Average Temp \n2. Week's Temp \n3. Current Temp");
  const tempChoice = prompt("Choose an option: ");
  let option;
  switch (tempChoice) {
    case "1":
      option = "Average";
      break;
    case "2":
      option = "Week";
      break;
    case "3":
      option = "Today";
      break;
    default:
      // Pass error to callback
      callback(new Error("Invalid option selected"));
      console.log("Entry must be a valid option (1, 2, or 3).");
      return;
  }
  const call = cropClient.MonitorTemperature({ option });
  call.on("data", (response) => {
    if (option === "Week") {
      console.log(
        `Day ${response.day} - Temperature: ${response.temperature.toFixed(
          1
        )}°C for the week`
      );
    } else if (option === "Average") {
      console.log(
        `Average temperature today is ${response.temperature.toFixed(1)}°C`
      );
    } else if (option === "Today") {
      console.log(
        `Current temperature now is ${response.temperature.toFixed(1)}°C`
      );
    }
  });
  call.on("end", () => {
    console.log("Temperature monitoring ended.");
    callback();
  });
  call.on("error", (err) => {
    console.error("Error during temperature monitoring:", err);
    callback(err);
  });
}

module.exports = { getWaterLevel, monitorTemperature };
