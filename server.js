const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
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
    const temperatures = [20, 21, 22, 23, 24, 25];
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
