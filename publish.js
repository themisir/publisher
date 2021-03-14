const dotenv = require("dotenv");
const { spawn } = require("child_process");
const package = require("./package.json");

dotenv.config();

let tags = ["latest"];

// Add version tags
const versionParts = package.version.split(".");
for (let i = 0; i < versionParts.length; i++) {
  tags.push(versionParts.filter((_, j) => j <= i).join("."));
}

tags = tags.map((tag) => `${process.env.DOCKER_IMAGE}:${tag}`);

function exec(cmd) {
  console.log("$", cmd);
  const [app, ...args] = cmd.split(" ");
  return new Promise((resolve, reject) =>
    spawn(app, args, { stdio: "inherit" })
      .on("exit", (code) => resolve(code))
      .on("error", reject)
  );
}

(async function main() {
  await exec(`docker build ${tags.map((tag) => `-t ${tag}`).join(" ")} .`);
  await exec(`docker push ${process.env.DOCKER_IMAGE} --all-tags`);
})();
