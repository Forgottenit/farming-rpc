const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const inventory = {
  corn: 1000,
  hay: 1500,
};

// Load the proto file using protoLoader
const packageDefinition = protoLoader.loadSync(
  "./proto/feed_management.proto",
  {}
);

// Load the Feed Management service definition from the proto file
const feedProto =
  grpc.loadPackageDefinition(packageDefinition).farm.feed_management;

// Create a new gRPC server
const server = new grpc.Server();

// Add the FarmManagement service to the server
server.addService(feedProto.FeedManagement.service, {
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
  "0.0.0.0:50052",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.error("Server failed to start:", error);
      return;
    }
    server.start();
    console.log(`Feed Management Server running at http://0.0.0.0:${port}`);
  }
); //bindAsync
