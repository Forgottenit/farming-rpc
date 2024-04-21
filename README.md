# Farming RPC Service

This project implements a gRPC service for managing various farming operations such as crop management, feed management, and health management. It includes separate gRPC servers for each service and a client that interacts with these services.

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
node server/CropManagementServer.js
node server/FeedManagementServer.js
node server/HealthManagementServer.js
```

Make sure to check if the ports are available.

### Running the Client

After starting the gRPC servers, you can run the client to interact with the services:

```bash
node client/main.js
```

The client provides a CLI to interact with the services. Follow the prompts to perform different operations.
