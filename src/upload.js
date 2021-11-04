const AWS = require('aws-sdk');

const BUCKET_NAME = process.env.BUCKET_NAME;
const PIPELINE_ID = process.env.PIPELINE_ID;
const TRANSCODER_REGION = process.env.TRANSCODER_REGION;

const transcoder = new AWS.ElasticTranscoder({
  apiVersion: '2012–09–25',
  region: TRANSCODER_REGION,
});

module.exports.handler = async (event) => {
  var bucket = event.Records[0].s3.bucket.name;
  var key = event.Records[0].s3.object.key;

  if (bucket !== BUCKET_NAME) {
    context.fail('Incorrect input bucket');
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

  console.log('Starting a job');
  transcoder.createJob(params, function (err, data) {
    if (err) {
      console.log(err);
    } else {
      console.log(data);
    }
    context.succeed('Job successfully completed');
  });
};
