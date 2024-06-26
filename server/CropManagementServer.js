//Require the gRPC module
const grpc = require("@grpc/grpc-js");
//Require the server instances
const { cropServer, cropProto } = require("./serverInstances");

// Add the FarmManagement service to the server
cropServer.addService(cropProto.CropManagement.service, {
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
      // Check the user's option
      let option = call.request.option;
      let temperature;
      // Switch statement to handle different temp options (Average, Week, Today)
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
      // End the stream after sending the data
      call.end();
    } catch (err) {
      // Handle any errors
      call.end(new Error("Failed to send temperature data: " + err.message));
    }
  },
}); //addService

// Start the server
cropServer.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Server failed to start:", error);
      return;
    }
    cropServer.start();
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
