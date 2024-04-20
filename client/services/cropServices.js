const { cropClient } = require("../clientInstances");

function getWaterLevel(sensorId, callback) {
  cropClient.GetWaterLevel({ sensorId }, (error, response) => {
    if (error) {
      console.error("Error fetching water level:", error);
      callback(error);
    } else {
      console.log(`Water level: ${response.level} inches`);
      callback(null, response.level);
    }
  });
}

function monitorTemperature(callback) {
  const call = cropClient.MonitorTemperature({});
  call.on("data", (response) =>
    console.log(`Temperature: ${response.temperature}C`)
  );
  call.on("end", () => {
    console.log("Temperature monitoring ended.");
    callback();
  });
}

module.exports = { getWaterLevel, monitorTemperature };
