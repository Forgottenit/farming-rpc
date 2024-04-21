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
  // Unary RPC with error handling for water level
  GetWaterLevel: (call, callback) => {
    try {
      console.log("Fetching water level for sensor:", call.request.sensorId);

      // Check if the sensor ID is provided
      if (!call.request.sensorId) {
        throw new Error("Sensor ID is required");
      }

      // Simulate fetching or calculating the water level
      let level = Math.random() * 5; // Random level between 20 and 100
      let formattedLevel = level.toFixed(2);
      // Send the response back to the client with the calculated level
      callback(null, { level: formattedLevel });
      console.log(
        `Water level for sensor ${call.request.sensorId}: ${formattedLevel} inches`
      );
    } catch (err) {
      // Handle any errors by sending an appropriate message back to the client
      callback({
        code: grpc.status.INVALID_ARGUMENT,
        message: err.message,
      });
    }
  }, //GetWaterLevel

  // Server-side Streaming RPC for monitoring temperature
  MonitorTemperature: (call) => {
    try {
      let option = call.request.option;
      let temperature;

      switch (option) {
        case "Average":
          temperature = Math.random() * 8 + 5;
          console.log(`Sending average temperature: ${temperature}°C`);
          call.write({ temperature: temperature });
          break;

        case "Week":
          for (let i = 1; i <= 7; i++) {
            temperature = Math.random() * 8 + 2;
            console.log(`Sending weekly temperature: ${temperature}°C`);
            call.write({ temperature: temperature, day: i });
          }
          break;

        case "Today":
          temperature = Math.random() * 8 + 4;
          console.log(`Sending todays temperature: ${temperature}°C`);
          call.write({ temperature: temperature });
          break;

        default:
          call.write({ temperature: "Invalid option" });
          break;
      }
      call.end();
    } catch (err) {
      call.end(new Error("Failed to send temperature data: " + err.message));
    }
  },
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
