const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const protoOptions = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
};

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

const cropProto = grpc.loadPackageDefinition(cropManagementDefinition).farm
  .crop_management;
const feedProto = grpc.loadPackageDefinition(feedManagementDefinition).farm
  .feed_management;
const healthProto = grpc.loadPackageDefinition(healthManagementDefinition).farm
  .health_management;

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

module.exports = {
  cropClient,
  feedClient,
  healthClient,
};
