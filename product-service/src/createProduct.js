import { Client } from 'pg';
import { headers, errMessage } from './helpers.js';
import { DB_OPTIONS } from './constants.js';

export const createProduct = async(event) => {
  console.log('createProduct lambda called with event: ', event);
  const { title, count, description, price } = JSON.parse(event.body);
  
  if (!(title && (count && !isNaN(count) && count > 0) && description && (price && !isNaN(price) && price > 0))) {
    return {
      statusCode: 400,
      headers,
      body: `Wrong parameters: title: ${title}, count ${count}, description ${description}, price ${price}`
    }
  }
  // get new DB client (cause using pools is not good for lambdas)
  const client = new Client(DB_OPTIONS);
  await client.connect();
    try {
      await client.query('BEGIN')
      const { rows } = await client.query(
        `insert into products (title, description, price) values ($1, $2, $3) returning *`,
        [title, description, price]
      );
      await client.query(
        `insert into stocks (product_id, count) values ($1, $2) returning product_id`,
        [rows[0].id, count]
      );
      await client.query('COMMIT')
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({...rows[0], count}),
        }
    } catch (err) {
        console.error('getProductById lambda crashed with error:', err)
        await client.query('ROLLBACK');
        return errMessage;
    } finally {
        client.end();
    }
}