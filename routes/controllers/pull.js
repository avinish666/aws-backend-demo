const fs = require("fs").promises;
const path = require("path");
const { s3, S3_BUCKET } = require("../config/aws-config");

async function pullRepo() {
    const repoPath = path.resolve(process.cwd(), ".apnaGit");

    try {
        const data = await s3.listObjectsV2({
            Bucket: S3_BUCKET,
            Prefix: "commits"
        }).promise();

        const objects = data.Contents || [];

        for (const object of objects) {
            const key = object.Key;

            // Create directory structure
            const localFilePath = path.join(repoPath, key);
            const localDir = path.dirname(localFilePath);

            await fs.mkdir(localDir, { recursive: true });

            // Download file from S3
            const fileContent = await s3.getObject({
                Bucket: S3_BUCKET,
                Key: key
            }).promise();

            await fs.writeFile(localFilePath, fileContent.Body);

            console.log(`Downloaded: ${key}`);
        }

        console.log("All commits pulled from S3");
    } catch (err) {
        console.error("Unable to pull:", err);
    }
}

module.exports = { pullRepo };