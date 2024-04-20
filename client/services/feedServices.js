const { feedClient } = require("../clientInstances");

// ManageFeed - streams feed requests to the server
function manageFeed(requests, callback) {
  const call = feedClient.ManageFeed();

  call.on("data", (response) => {
    console.log(`Feed status: ${response.status}`);
  });

  call.on("end", () => {
    console.log("Stream ended.");
    callback(); // Call callback after operation is complete
  });

  requests.forEach((req) => {
    call.write({ type: req.type, quantity: req.quantity });
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
