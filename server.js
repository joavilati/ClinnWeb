const path = require("path");

const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT_server || process.env.PORT_SERVER || process.env.PORT || "21151", 10);

console.log(`[ClinNota] Starting on ${hostname}:${port}`);

process.env.HOSTNAME = hostname;
process.env.PORT = String(port);

const standaloneDir = path.join(__dirname, ".next", "standalone");
process.chdir(standaloneDir);
require(path.join(standaloneDir, "server.js"));
