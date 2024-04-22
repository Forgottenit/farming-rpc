// Create instances of the gRPC clients for the crop, feed, and health management services
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
// configuration options for protoLoader
const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};
// Load the proto files for the crop, feed, and health management services
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
// Load package definitions for the crop, feed, and health management services to create client instances
const cropProto = grpc.loadPackageDefinition(cropManagementDefinition).farm
  .crop_management;
const feedProto = grpc.loadPackageDefinition(feedManagementDefinition).farm
  .feed_management;
const healthProto = grpc.loadPackageDefinition(healthManagementDefinition).farm
  .health_management;
// Connect to the gRPC server for the crop, feed, and health management services
const cropClient = new cropProto.CropManagement(
  "localhost:50051",
  grpc.credentials.createInsecure()
);
const feedClient = new feedProto.FeedManagement(
  "localhost:50052",
  grpc.credentials.createInsecure()
);
const healthClient = new healthProto.HealthManagement(
  "localhost:50053",
  grpc.credentials.createInsecure()
);
// Export the client instances for the crop, feed, and health management services
module.exports = {
  cropClient,
  feedClient,
  healthClient,
};
