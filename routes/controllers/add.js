const fs= require("fs").promises;
const path=require("path")

async function addRepo(filePath){
    const addRepo=path.resolve(process.cwd(), ".apnagit");
    const stagingPath=path.join(repoPath, "staging");

    try{
        await fs.mkdir(stagingPath, { recursive:true});
        const fileName=path.baseName(filePath);
        await fs.copyFile(filePath, path.join(stagingPath, fileName));
        console.log(`File ${fileName} added to the staging area`)
    } catch(err) {
        console.error("Adding Error file :", err);
    }
}
module.exports={addRepo};