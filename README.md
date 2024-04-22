# Farming RPC Service

This project implements a gRPC service for managing various farming operations such as crop management, feed management, and health management. It includes separate gRPC servers for each service and a client that interacts with these services.

## Services Description

### Crop Management

- GetWaterLevel: Unary RPC that retrieves the water level from a specified sensor.
- MonitorTemperature: Server streaming RPC that continuously provides temperature readings based on the specified option ("average", "weekly", or "today").

### Feed Management

- ManageFeed: Bi-directional streaming RPC that allows for ongoing communication to manage feed requests and receive updates dynamically.
- GetInventory: Unary RPC that provides a snapshot of the current inventory levels, detailing quantities of various feed types.

### Health Management

- ReportHealth: Client streaming RPC that allows for multiple health reports to be sent consecutively from the client to the server, culminating in a summary of all reports received.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Requirements

Before running this project, you'll need to have the following installed:

- [Node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/Forgottenit/farming-rpc.git
cd <farming-rpc>
```

2. Install the necessary npm packages:

```bash
npm install
```

```bash
npm install prompt-sync
```

### Running the Services

To start each gRPC server, run the following commands in separate terminal windows:

```bash
node server/CropManagementServer.js # For Crop Services
node server/FeedManagementServer.js # For Feed Services
node server/HealthManagementServer.js # For Health Report Services
```

Make sure to check if the ports are available.

### Running the Client

After starting the gRPC servers, you can run the client to interact with the services:

```bash
node client/main.js
```

The client provides a CLI to interact with the services. Follow the prompts to perform different operations.
