const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const readline = require("readline");
// Load the proto file using protoLoader
const packageDefinition = protoLoader.loadSync(
  "./proto/farm_management.proto",
  {}
);
// Load the FarmManagement service definition from the proto file
const farmProto = grpc.loadPackageDefinition(packageDefinition).farm;
// Create a client instance for the FarmManagement service
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
// ReportHealth function - streams health reports to the server
function reportHealth(callback) {
  const reports = [];
  let reportCounter = 0;
  console.log("Enter health reports. Type 'done' for report ID to finish.");
  // Gather health reports from the user
  function gatherReports() {
    rl.question("Enter Animal type (or 'done' to finish): ", (type) => {
      if (type.toLowerCase() === "done") {
        sendReportsToServer();
        return;
      }
      rl.question("Enter animal ID: ", (id) => {
        rl.question("Enter health description: ", (healthDescription) => {
          reportCounter++;
          reports.push({
            reportId: reportCounter.toString(),
            type: type,
            animalId: id,
            healthDescription: healthDescription,
          });
          gatherReports(); // Continue to gather more reports
        });
      });
    });
  }
  // Send the health reports to the server
  function sendReportsToServer() {
    console.log("Sending reports to server...");
    const call = client.ReportHealth((error, response) => {
      if (error) {
        console.error("Error reporting health:", error);
      } else {
        console.log("Health reports summary received from server:");
        response.reports.forEach((report) => {
          console.log(
            `Report ID: ${report.reportId}, Details: ${report.details}`
          );
        });
      }
      callback(); // call callback after operation is complete
    });

    reports.forEach((report) => {
      call.write(report); // Send each report to the server
    });

    call.end(); // End the client stream
  }

  gatherReports(); // Initial call to start gathering reports
}
// Create a readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
// Main function to display options and process user input
function main() {
  console.log("Select an Operation:");
  console.log("1. Get Water Level");
  console.log("2. Monitor Temperature");
  console.log("3. Report Health");
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
// Process the user's choice and call the appropriate function
function processChoice(choice, callback) {
  switch (choice) {
    case "1":
      getWaterLevel("sensor123", callback);
      break;
    case "2":
      monitorTemperature(callback);
      break;
    case "3":
      reportHealth(callback);
      break;

    default:
      console.log("Invalid choice. Please choose again.");
      callback();
      break;
  }
}
// Start the main function
main();
