const AWS = require("aws-sdk");
const fs = require("fs");
const {
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_BUCKET_REGION,
  AWS_SECRET_ACCESS_KEY,
} = require("../config");

const SESConfig = {
  apiVersion: "latest",
  accessKeyId: AWS_ACCESS_KEY_ID,
  credentials: {
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_BUCKET_REGION,
  },
};

AWS.config.update({ SESConfig });

const s3 = new AWS.S3({
  AWS_BUCKET_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
});

module.exports = {
  uploadFile,
};

//uploads a file to s3

function uploadFile(file, path) {
  const fileStream = fs.createReadStream(file.path);

  const uploadParams = {
    Bucket: AWS_BUCKET_NAME,
    Body: fileStream,
    Key: path,
  };

  return s3.upload(uploadParams).promise();
}
