const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// Load the proto file using protoLoader
const packageDefinition = protoLoader.loadSync(
  "./proto/crop_management.proto",
  {}
);

// Load the Crop Management service definition from the proto file
const farmProto =
  grpc.loadPackageDefinition(packageDefinition).farm.crop_management;

// Create a new gRPC server
const server = new grpc.Server();

// Add the FarmManagement service to the server
server.addService(farmProto.CropManagement.service, {
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
