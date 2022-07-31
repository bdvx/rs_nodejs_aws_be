import { Client } from 'pg';
import { headers, errMessage } from './helpers.js';
import { DB_OPTIONS } from './constants.js';
import { URL } from './productList.js';

export const getAllProducts = async (event) => {
  console.log('getAllProducts lambda called with event: ', event);
  
  // get new DB client (cause using pools is not good for lambdas)
  const client = new Client(DB_OPTIONS);
  await client.connect();

  try {

  // search needed product - by id field
  let { rows } = await client.query(`
  select * from products p inner join stocks s on p.id = s.product_id
  `);

    // string just to add image mock, will be removed
    rows = rows.map((val)=>{val.image = URL; return val;});

  if (!rows){
    return {
        headers,
        statusCode: 404,
        body: "Target products were not found",
      };
  }

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(rows),
  };

  } catch (err) {
    console.error('getProductById lambda crashed with error:', err)
    return errMessage;
  } finally {
    client.end();
  }

};