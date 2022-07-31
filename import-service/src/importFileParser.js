import AWS from 'aws-sdk';
import { errMessage } from './helpers.js';

export const importFileParser = async (event) => {
    console.log('importFileParser lambda called with event: ', event);

    const { BUCKET: Bucket, REGION: region } = process.env;
    
    try {
        const s3 = new AWS.S3({region, signatureVersion: 'v4'});
        const csv = require('csv-parser');
        for( const record of (event.Records || []) ){

            const { key: Key } = record.s3.object || {};
            const parsedKey = Key.replace('uploaded', 'parsed');
            const params = { Bucket, Key };

            const s3Stream = s3.getObject(params).createReadStream();

            await new Promise((resolve, reject) =>{
            s3Stream.pipe(csv())
                .on('data', (data) => { console.log('CSV DATA:', data); })
                .on('error', (error) => { 
                    console.log('importFileParser parse error:', error);
                    reject();
                })
                .on('end', async () => {
                    await s3.copyObject({
                        Bucket,
                        CopySource: encodeURIComponent(`${Bucket}/${Key}`),
                        Key: parsedKey,
                    }).promise();

                    console.log(`copied ${Key} from uploaded to parsed`);

                    await s3.deleteObject(params)
                            .promise();
                    resolve();
                })
            })
        }

      } catch (err) {
          console.error('importFileParser lambda crashed with error:', err)
          return errMessage;
      }

}