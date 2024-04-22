// require the clientInstances module
const { healthClient } = require("../clientInstances");
// require the readlineInterface module to get user input
const rl = require("../utils/readlineInterface");
// ReportHealth function - streams health reports to the server
function reportHealth(callback) {
  // Array to store health reports
  const reports = [];
  let reportCounter = 0;
  console.log("Enter health reports. Type 'done' for report ID to finish.");
  // Gather health reports from the user
  function gatherReports() {
    // Get animal type, ID, and health description from the user
    rl.question("Enter Animal type (or 'done' to finish): ", (type) => {
      if (type.toLowerCase() === "done") {
        sendHealthReportsToServer();
        return;
      }
      rl.question("Enter animal ID: ", (id) => {
        rl.question("Enter health description: ", (healthDescription) => {
          reportCounter++;
          reports.push({
            reportId: reportCounter.toString(),
            type: type,
            animalId: id,
            healthDescription: healthDescription,
          });
          gatherReports(); // Continue to gather more reports
        });
      });
    });
  }
  // Send the health reports to the server
  function sendHealthReportsToServer() {
    console.log("Sending reports to server...");
    // client stream to send health reports to the server using ReportHealth RPC
    const call = healthClient.ReportHealth((error, response) => {
      if (error) {
        console.error("Error reporting health:", error);
      } else {
        console.log("Health reports summary received from server:");
        response.reports.forEach((report) => {
          console.log(
            `Report ID: ${report.reportId}, Details: ${report.details}`
          );
        });
      }
      // Call the callback function
      callback();
    });
    // Send each health report to the server
    reports.forEach((report) => {
      call.write(report);
    });
    // End the client stream
    call.end();
  }
  // gather health reports
  gatherReports();
}
// Export the reportHealth function
module.exports = { reportHealth };
