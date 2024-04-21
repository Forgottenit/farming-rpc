const grpc = require("@grpc/grpc-js");
const { healthServer, healthProto } = require("./serverInstances");

// Add the FarmManagement service to the server
healthServer.addService(healthProto.HealthManagement.service, {
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
}); //addService

// Start the server
healthServer.bindAsync(
  "0.0.0.0:50053",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Server failed to start:", error);
      return;
    }
    healthServer.start();
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
