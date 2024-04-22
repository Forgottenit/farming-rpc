// require the clientInstances module to get the feedClient instance
const { feedClient } = require("../clientInstances");
// prompt-sync module to get user input from the console synchronously
const prompt = require("prompt-sync")({ sigint: true });

// ManageFeed - streams feed requests to the server
function manageFeed(callback) {
  let valid = false; // Flag to check the validity of the input
  let animalChoice;
  // Loop until a valid choice is made
  while (!valid) {
    console.log("\nChoose the animal to feed:");
    console.log("1. Feed Cows");
    console.log("2. Feed Chickens");
    animalChoice = prompt("Enter your choice: ");

    if (animalChoice === "1" || animalChoice === "2") {
      valid = true; // Set flag to true when a valid choice is made
    } else {
      console.log(
        "\nInvalid choice. Please choose 1 for Cows or 2 for Chickens."
      );
    }
  }
  // Array to store feed requests
  let requests = [];
  // Handle requests based on the animal choice
  if (animalChoice === "1") {
    requests.push({ type: "hay", quantity: 100 }); // For cows
  } else if (animalChoice === "2") {
    requests.push({ type: "corn", quantity: 50 }); // For chickens
  }
  // Create and handle the gRPC call
  const call = feedClient.ManageFeed();
  call.on("data", (response) => {
    let animalType;
    switch (animalChoice) {
      case "1":
        animalType = "cows";
        break;
      case "2":
        animalType = "chickens";
        break;
      default:
        animalType = "unknown";
    }
    // Log the feed status for the animal
    console.log(`Feed status for ${animalType}: ${response.status}`);
  });
  // Handle the end and error events
  call.on("end", () => {
    console.log("Feed management stream ended.");
    callback(); // No error, calling callback with no parameters
  });
  call.on("error", (err) => {
    console.error("Error during feed management:", err);
    callback(err); // Pass error to the callback
  });

  // Send the feed request
  requests.forEach((req) => {
    call.write(req);
  });
  call.end();
}
// CheckInventory - retrieves the current inventory levels using Unary RPC
function checkInventory(callback) {
  // Call the GetInventory RPC
  feedClient.GetInventory({}, (error, response) => {
    if (error) {
      console.error("Error fetching inventory:", error.message);
      // Call the callback with the error if an error occurs
      callback(error);
    } else {
      if (response && response.inventory) {
        console.log("Current Inventory Levels:");
        Object.entries(response.inventory).forEach(([item, quantity]) => {
          console.log(`- ${item}: ${quantity} units`);
        });
        console.log("Inventory checked successfully.");
      } else {
        console.log("No inventory data available.");
      }
      // Call the callback after the operation is complete
      callback();
    }
  });
}
// Export the manageFeed and checkInventory functions
module.exports = { manageFeed, checkInventory };
