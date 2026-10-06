const fs = require("fs").promises;
const path = require("path");
const { v4: uuidv4 } = require("uuid");

async function commitRepo(message) {
  try {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");
    const stagedPath = path.join(repoPath, "staging");
    const commitsPath = path.join(repoPath, "commits");

    // ✅ create commits folder
    await fs.mkdir(commitsPath, { recursive: true });

    const commitID = uuidv4();

    // ✅ create folder for this commit
    const commitDir = path.join(commitsPath, commitID);
    await fs.mkdir(commitDir);

    // ✅ read staged files
    const files = await fs.readdir(stagedPath);

    for (const file of files) {
      await fs.copyFile(
        path.join(stagedPath, file),
        path.join(commitDir, file)
      );
    }

    // ✅ save commit metadata
    await fs.writeFile(
      path.join(commitDir, "commit.json"),
      JSON.stringify(
        {
          id: commitID,
          message: message,
          date: new Date().toISOString(),
        },
        null,
        2
      )
    );

    console.log(`${commitID} created with message: ${message}`);

  } catch (err) {
    console.error("error committing files:", err);
  }
}

module.exports = { commitRepo };