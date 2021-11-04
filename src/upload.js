const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.BUCKET_NAME;
const PIPELINE_ID = process.env.PIPELINE_ID;
const TRANSCODER_REGION = process.env.TRANSCODER_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

const transcoder = new AWS.ElasticTranscoder({
  apiVersion: '2012–09–25',
  region: TRANSCODER_REGION,
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
});

module.exports.handler = async (event) => {
  var bucket = event.Records[0].s3.bucket.name;
  var key = event.Records[0].s3.object.key;

  if (bucket !== BUCKET_NAME) {
    context.fail('Incorrect input bucket specified');
    return;
  }

  var srcKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, ' ')
  ); // the object may have spaces
  var newKey = key.split('.')[0];
  var params = {
    PipelineId: PIPELINE_ID,
    OutputKeyPrefix: newKey + '/',
    Input: {
      Key: srcKey,
      FrameRate: 'auto',
      Resolution: 'auto',
      AspectRatio: 'auto',
      Interlaced: 'auto',
      Container: 'auto',
    },
    Outputs: [
      {
        Key: newKey + '.mp4',
        ThumbnailPattern: 'thumbs-' + newKey + '-{count}',
        PresetId: '1351620000001-100020',
        Watermarks: [],
      },
    ],
  };

  console.log('Starting transcoding job', AWS_ACCESS_KEY_ID);
  transcoder.createJob(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
    context.succeed('Job successfully completed');
  });
};
