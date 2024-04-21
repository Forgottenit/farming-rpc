const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

// Load proto definitions
const cropManagementDefinition = protoLoader.loadSync(
  "./proto/crop_management.proto",
  protoOptions
);
const feedManagementDefinition = protoLoader.loadSync(
  "./proto/feed_management.proto",
  protoOptions
);
const healthManagementDefinition = protoLoader.loadSync(
  "./proto/health_management.proto",
  protoOptions
);

// Load package definitions
const cropProto = grpc.loadPackageDefinition(cropManagementDefinition).farm
  .crop_management;
const feedProto = grpc.loadPackageDefinition(feedManagementDefinition).farm
  .feed_management;
const healthProto = grpc.loadPackageDefinition(healthManagementDefinition).farm
  .health_management;

// Create server instances
const cropServer = new grpc.Server();
const feedServer = new grpc.Server();
const healthServer = new grpc.Server();

module.exports = {
  cropServer,
  feedServer,
  healthServer,
  cropProto,
  feedProto,
  healthProto,
};
