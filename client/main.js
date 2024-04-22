const {
  getWaterLevel,
  monitorTemperature,
} = require("./services/cropServices");
const { manageFeed, checkInventory } = require("./services/feedServices");
const { reportHealth } = require("./services/healthServices");
const rl = require("./utils/readlineInterface");

function main() {
  console.log("\nSelect an Operation:");
  console.log("1. Get Water Levels");
  console.log("2. Get Temperature Levels");
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
      getWaterLevel((err) => {
        if (err) {
          console.log("\nOperation failed", err);
        }
        callback();
      });
      break;
    case "2":
      monitorTemperature((err) => {
        if (err) {
          console.log("\nOperation failed:", err.message);
        }
        callback();
      });
      break;
    case "3":
      reportHealth((err) => {
        if (err) {
          console.log("\nOperation failed");
        }
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
    case "6":
      console.log("\nExiting application.");
      //close the readline interface
      rl.close();
      //exit the process
      process.exit(0);
    default:
      console.log("\nInvalid choice. Please choose again.");
      callback();
      break;
  }
}
// Start the main function
main();
