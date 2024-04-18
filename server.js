const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const inventory = {
  corn: 1000,
  wheat: 1500,
};
// Load the proto file using protoLoader
const packageDefinition = protoLoader.loadSync(
  "./proto/farm_management.proto",
  {}
);
// Load the FarmManagement service definition from the proto file
const farmProto = grpc.loadPackageDefinition(packageDefinition).farm;
// Create a new gRPC server
const server = new grpc.Server();
// Add the FarmManagement service to the server
server.addService(farmProto.FarmManagement.service, {
  // Implement Unary RPC
  GetWaterLevel: (call, callback) => {
    console.log("Fetching water level for sensor:", call.request.sensorId);
    callback(null, { level: 2 });
  }, //GetWaterLevel

  // Implement Server-side Streaming RPC
  MonitorTemperature: (call) => {
    const temperatures = [20, 21, 22, 21, 24, 25, 22];
    temperatures.forEach((temp) => {
      call.write({ temperature: temp });
    });
    call.end();
  }, //MonitorTemperature

  // Implement Client-side Streaming RPC for ReportHealth
  ReportHealth: (call, callback) => {
    // Create an array to store the health reports
    let reports = [];
    // Receive health reports from the client
    call.on("data", (report) => {
      console.log(
        `Received health report: ID=${report.reportId}, Type=${report.type}, Animal ID=${report.animalId}, Description=${report.healthDescription}`
      );
      // Create a ReportInfo object and add it to the reports array
      reports.push({
        reportId: report.reportId,
        details: `Type=${report.type}, Animal ID=${report.animalId}, Description=${report.healthDescription}`,
      });
    });
    // When the client finishes sending reports, send the HealthSummary back
    call.on("end", () => {
      console.log("Finished receiving health reports.");
      // Send the HealthSummary with all ReportInfo data back to the client
      console.log(
        "Sending back health summary:",
        JSON.stringify({ reports: reports })
      );
      callback(null, { reports: reports });
    });
    // Handle errors
    call.on("error", (err) => {
      console.error("Error during ReportHealth:", err);
    });
  }, //ReportHealth

  // Implement Bidirectional Streaming RPC
  ManageFeed: (call) => {
    call.on("data", (request) => {
      console.log("Received feed request:", request);
      call.write({
        status: `Processed request for ${request.quantity} units of ${request.type}`,
      });
    });
    call.on("end", () => {
      call.end();
    });
  },
  // Implement Bidirectional Streaming RPC
  ManageFeed: (call) => {
    call.on("data", (request) => {
      console.log("Received feed request:", request);
      if (inventory[request.type] !== undefined) {
        if (inventory[request.type] >= request.quantity) {
          inventory[request.type] -= request.quantity; // Decrease inventory
          call.write({
            status: `Processed request for ${request.quantity} units of ${
              request.type
            }. Remaining: ${inventory[request.type]}`,
          });
        } else {
          call.write({
            status: `Not enough stock for ${request.type}. Available: ${
              inventory[request.type]
            }`,
          });
        }
      } else {
        call.write({
          status: `No such feed type: ${request.type}`,
        });
      }
    });
    call.on("end", () => {
      call.end();
    });
  }, //ManageFeed

  // Implement Server-side Streaming RPC
  GetInventory: (call, callback) => {
    console.log("Fetching inventory levels");
    callback(null, { inventory: inventory });
  }, //GetInventory
}); //addService
// Start the server
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) throw error;
    server.start();
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
