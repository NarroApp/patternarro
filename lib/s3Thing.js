var s3 = require('s3'),
  client = s3.createClient({
      maxAsyncS3: 20,     // this is the default
      s3RetryCount: 3,    // this is the default
      s3RetryDelay: 1000, // this is the default
      multipartUploadThreshold: 20971520, // this is the default (20 MB)
      multipartUploadSize: 15728640, // this is the default (15 MB)
      s3Options: {
          accessKeyId: process.env.AWS_ACCESS_KEY,
          secretAccessKey: process.env.AWS_SECRET_KEY
      }
  });

function thing(local, remote, bucket, cb) {
    var params = {
            localFile: local,
            s3Params: {
                Bucket: bucket,
                Key: remote
            }
        },
        uploader = client.uploadFile(params);

    uploader.on('error', function(err) {
        console.error('unable to upload file to s3:', err.stack);
        cb(err, null, null);
    });

    uploader.on('end', function(data) {
        console.log('done uploading file to s3');
        cb(null, data, ('https://s3.amazonaws.com/' + bucket + '/' + remote));
    });
}

module.exports = thing;
