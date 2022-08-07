import AWS from 'aws-sdk';
import { errMessage } from '../../import-service/src/helpers.js';
import { createProduct } from './createProduct.js';

export const catalogBatchProcess = async (event) => {
    console.log('catalogBatchProcess lambda called with event: ', event);

    try {
        const { REGION: region } = process.env;
        const sns = new AWS.SNS({ region });
        const items = event.Records.map(({ body }) => JSON.parse(body));
        // will add data validation later, as it's not a part of the task but good to have
        items.forEach(async (item) => { await createProduct(item) });
        // sending notification once it created all products in items array
        sns.publish({
            TopicArn: process.env.SNS_ARN,
            Subject: `Items created`,
            Message: `Count: ${items.length}`
        }, error => {
            if(error) {
                console.error('catalogBatchProcess lambda email sent crash with error', error);
                return;
            }
            console.log('catalogBatchProcess lambda email sent');
        });
    } catch (error) {
        console.error('catalogBatchProcess lambda crashed with error', error);
        return errMessage;    
    }

}