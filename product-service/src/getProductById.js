import { Client } from 'pg';
import { headers, errMessage } from './helpers.js';
import { DB_OPTIONS } from './constants.js';
import { URL } from './productList.js';

export const getProductById = async (event) => {
  console.log('getProductById lambda called with event: ', event);
  const { productId } = event.pathParameters;
  // get new DB client (cause using pools is not good for lambdas)
  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {
  // search needed product - by id field
  let { rows } = await client.query(`
  select * from products p inner join stocks s on p.id = s.product_id where p.id = '${productId}'
  `);
  // string just to add image mock, will be removed
  rows = rows.map((val)=>{val.image = URL; return val;});

  if (!rows.length){
    return {
        headers,
        statusCode: 404,
        body: "Target product was not found",
      };
  }

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(rows[0]),
  };

  } catch (err) {
    console.error('getProductById lambda crashed with error:', err)
    return errMessage;
  } finally {
    client.end();
  }

};