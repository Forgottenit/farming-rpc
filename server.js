const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const packageDefinition = protoLoader.loadSync(
  "./proto/farm_management.proto",
  {}
);
const farmProto = grpc.loadPackageDefinition(packageDefinition).farm;

const server = new grpc.Server();

server.addService(farmProto.FarmManagement.service, {
  // Implement Unary RPC
  GetWaterLevel: (call, callback) => {
    console.log("Fetching water level for sensor:", call.request.sensorId);
    callback(null, { level: 42 });
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) throw error;
    server.start();
    console.log(`Server running at http://0.0.0.0:${port}`);
  }
);
