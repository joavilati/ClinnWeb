const path = require("path");

const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT_SERVER || process.env.PORT || "3000", 10);

process.env.HOSTNAME = hostname;
process.env.PORT = String(port);

const standaloneDir = path.join(__dirname, ".next", "standalone");
process.chdir(standaloneDir);
require(path.join(standaloneDir, "server.js"));
