const grpc = require("@grpc/grpc-js");
const { feedServer, feedProto } = require("./serverInstances");
const inventory = {
  corn: 1000,
  hay: 1500,
};

// Add the FarmManagement service to the server
feedServer.addService(feedProto.FeedManagement.service, {
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
feedServer.bindAsync(
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Server failed to start:", error);
      return;
    }
    feedServer.start();
    console.log(`Feed Management Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
