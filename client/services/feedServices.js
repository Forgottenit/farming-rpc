const { feedClient } = require("../clientInstances");
const prompt = require("prompt-sync")({ sigint: true });

// ManageFeed - streams feed requests to the server
function manageFeed(callback) {
  let valid = false; // Flag to check the validity of the input
  let animalChoice;

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
// CheckInventory - retrieves the current inventory levels
function checkInventory(callback) {
  feedClient.GetInventory({}, (error, response) => {
    if (error) {
      console.error("Error fetching inventory:", error);
    } else {
      console.log(`Inventory Levels: ${JSON.stringify(response.inventory)}`);
    }
    callback(); // Call callback after operation is complete
  });
}
module.exports = { manageFeed, checkInventory };
