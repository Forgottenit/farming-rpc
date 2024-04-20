const {
  getWaterLevel,
  monitorTemperature,
} = require("./services/cropServices");
const { manageFeed, checkInventory } = require("./services/feedServices");
const { reportHealth } = require("./services/healthServices");
const rl = require("./utils/readlineInterface");

function main() {
  console.log("\nSelect an Operation:");
  console.log("1. Get Water Level");
  console.log("2. Monitor Temperature for last 7 days");
  console.log("3. Report Health");
  console.log("4. Feed Animals");
  console.log("5. Check Inventory");
  console.log("6. Exit");

  rl.question("Enter your choice: ", function (choice) {
    processChoice(choice, () => main());
  });
}

function processChoice(choice, callback) {
  switch (choice) {
    case "1":
      getWaterLevel("sensor123", (err) => {
        if (err) console.log("Operation failed");
        callback();
      });
      break;
    case "2":
      monitorTemperature(() => callback());
      break;
    case "3":
      reportHealth((err) => {
        if (err) console.log("Operation failed");
        callback();
      });
      break;
    case "4":
      manageFeed(
        [
          { type: "corn", quantity: 10 },
          { type: "hay", quantity: 15 },
        ],
        callback
      );
      break;
    case "5":
      checkInventory(callback);
      break;

    default:
      console.log("Invalid choice. Please choose again.");
      callback();
      break;
  }
}
// Start the main function
main();
