const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");

const packageDefinition = protoLoader.loadSync(
  "./proto/farm_management.proto",
  {}
);
const farmProto = grpc.loadPackageDefinition(packageDefinition).farm;

const client = new farmProto.FarmManagement(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
// GetWaterLevel function - retrieves the water level for sensor ID
function getWaterLevel(sensorId, callback) {
  client.GetWaterLevel({ sensorId: sensorId }, (error, response) => {
    if (error) {
      console.error("Error fetching water level:", error);
    } else {
      console.log(`Water level: ${response.level} inches`);
    }
    callback(); // Call callback after operation is complete
  });
}

// MonitorTemperature function - streams temperature data
function monitorTemperature(callback) {
  const call = client.MonitorTemperature({});
  call.on("data", (response) => {
    console.log(`Temperature: ${response.temperature}`);
  });
  call.on("end", () => {
    console.log("Stream ended.");
    callback(); // Call callback after operation is complete
  });
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function main() {
  console.log("Select an Operation:");
  console.log("1. Get Water Level");
  console.log("2. Monitor Temperature");
  console.log("6. Exit");

  rl.question("Enter your choice: ", function (choice) {
    if (choice === "6") {
      console.log("Exiting...");
      rl.close();
    } else {
      processChoice(choice, () => {
        main(); // Only recall main after the operation is complete
      });
    }
  });
}

function processChoice(choice, callback) {
  switch (choice) {
    case "1":
      getWaterLevel("sensor123", callback);
      break;
    case "2":
      monitorTemperature(callback);
      break;

    default:
      console.log("Invalid choice. Please choose again.");
      callback();
      break;
  }
}

main();
