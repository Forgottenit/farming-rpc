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
  // Implement Unary RPC with error handling
  GetWaterLevel: (call, callback) => {
    try {
      console.log("Fetching water level for sensor:", call.request.sensorId);
      // If can't find sensor ID
      if (!call.request.sensorId) {
        throw new Error("Sensor ID is required");
      }
      callback(null, { level: 2 });
    } catch (err) {
      // Return an error to the client
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: err.message,
      });
    }
  }, //GetWaterLevel

  // Implement Server-side Streaming RPC with error handling
  MonitorTemperature: (call) => {
    try {
      const temperatures = [20, 21, 22, 21, 24, 25, 22];
      temperatures.forEach((temp) => {
        call.write({ temperature: temp });
      });
      call.end();
    } catch (err) {
      call.end(new Error("Failed to send temperature data: " + err.message));
    }
  }, //MonitorTemperature

  // Implement Client-side Streaming RPC with error handling for ReportHealth
  ReportHealth: (call, callback) => {
    let reports = [];
    call.on("data", (report) => {
      // Try Process each health report
      try {
        console.log(
          `Received health report: ID=${report.reportId}, Type=${report.type}, Animal ID=${report.animalId}, Description=${report.healthDescription}`
        );
        reports.push({
          reportId: report.reportId,
          details: `Type=${report.type}, Animal ID=${report.animalId}, Description=${report.healthDescription}`,
        });
      } catch (err) {
        console.error("Error processing report:", err);
      }
    });
    call.on("end", () => {
      try {
        console.log("Finished receiving health reports.");
        console.log(
          "Sending back health summary:",
          JSON.stringify({ reports: reports })
        );
        callback(null, { reports: reports });
      } catch (err) {
        callback({
          code: grpc.status.INTERNAL,
          message: "Failed to compile health reports: " + err.message,
        });
      }
    });
    call.on("error", (err) => {
      console.error("Error during ReportHealth:", err);
    });
  }, //ReportHealth

  // Implement Bidirectional Streaming RPC with error handling
  ManageFeed: (call) => {
    call.on("data", (request) => {
      try {
        console.log("Received feed request:", request);
        if (inventory[request.type] === undefined) {
          throw new Error(`No such feed type: ${request.type}`);
        }
        if (inventory[request.type] < request.quantity) {
          call.write({
            status: `Not enough stock for ${request.type}. Available: ${
              inventory[request.type]
            }`,
          });
        } else {
          inventory[request.type] -= request.quantity;
          call.write({
            status: `Processed request for ${request.quantity} units of ${
              request.type
            }. Remaining: ${inventory[request.type]}`,
          });
        }
      } catch (err) {
        call.write({
          status: err.message,
        });
      }
    });
    call.on("end", () => {
      call.end();
    });
  }, //ManageFeed

  // Implement Server-side Streaming RPC with error handling
  GetInventory: (call, callback) => {
    try {
      console.log("Fetching inventory levels");
      callback(null, { inventory: inventory });
    } catch (err) {
      callback({
        code: grpc.status.INTERNAL,
        message: "Failed to fetch inventory: " + err.message,
      });
    }
  }, //GetInventory
}); //addService

// Start the server
server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Server failed to start:", error);
      return;
    }
    server.start();
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
