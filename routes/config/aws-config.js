const AWS = require("aws-sdk");

AWS.config.update({
accessKeyId: "AKIAQGI6AYXC2HFSHO4D",
secretAccessKey: "pUNhoZ/7PaUsQhSNT1Qxwtbg4G0tUX9bvQLDshnS",
region: "ap-southeast-2"
});

const s3 = new AWS.S3();
const S3_BUCKET = "sampleavinish";

module.exports = { s3, S3_BUCKET };
