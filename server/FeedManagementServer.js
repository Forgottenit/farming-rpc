// Import the required modules
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
        if (!inventory[request.type]) {
          throw new Error(`No such feed type: ${request.type}`);
        }
        if (inventory[request.type] < request.quantity) {
          call.write({
            status: `Insufficient stock for ${request.type}. Available: ${
              inventory[request.type]
            }`,
          });
        } else {
          inventory[request.type] -= request.quantity;
          call.write({
            status: `Request has been filled: ${request.quantity} units of ${
              request.type
            }. Stock left: ${inventory[request.type]}`,
          });
        }
      } catch (err) {
        // Error handling within the stream should notify the client of the failure
        call.write({ status: `Error: ${err.message}` });
      }
    });
    call.on("end", () => {
      call.end(); // Ensure the stream is properly closed on the server side
    });
  },

  // Implement Unary RPC for inventory checking
  GetInventory: (call, callback) => {
    try {
      console.log("Fetching inventory levels");
      // Check if the inventory data exists
      if (!inventory) {
        throw new Error("Inventory data not found");
      }
      // Return the inventory data to the client
      callback(null, { inventory: inventory });
    } catch (err) {
      // Handle any errors and send message back to the client
      console.error("Failed to fetch inventory:", err.message);
      callback(
        {
          // gRPC status code for internal server error
          code: grpc.status.INTERNAL,
          message: "Failed to fetch inventory: " + err.message,
        },
        null
      );
    }
  },
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
