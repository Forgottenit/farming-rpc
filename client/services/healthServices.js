const { healthClient } = require("../clientInstances");
const rl = require("../utils/readlineInterface");
// ReportHealth function - streams health reports to the server
function reportHealth(callback) {
  const reports = [];
  let reportCounter = 0;
  console.log("Enter health reports. Type 'done' for report ID to finish.");
  // Gather health reports from the user
  function gatherReports() {
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
      callback(); // call callback after operation is complete
    });

    reports.forEach((report) => {
      call.write(report); // Send each report to the server
    });

    call.end(); // End the client stream
  }

  gatherReports(); // Initial call to start gathering reports
}
module.exports = { reportHealth };
