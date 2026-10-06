 const fs = require("fs").promises;
const path = require("path");

async function initRepo() {
  const repoPath = path.resolve(process.cwd(), ".apnaGit");
  const commitsPath = path.join(repoPath, "commits");

  try {
    await fs.mkdir(repoPath, { recursive: true });
    await fs.mkdir(commitsPath, { recursive: true });

    await fs.writeFile(
      path.join(repoPath, "config.json"),
      JSON.stringify(
        { bucket: process.env.S3_BUCKET },
        null,
        2
      )
    );

    console.log("Repository initialized");
  } catch (err) {
    console.error("Error initializing repository", err);
  }
}

module.exports = { initRepo };