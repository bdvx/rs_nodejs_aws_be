import productList from './productList.js';

export const getAllProducts = async (event) => {
  console.log('getAllProducts lambda called with event: ', event);
  
  // emulate delay from remote URL fetch
  // suppose we'll get real URL here and not file with hardcoded values
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    headers: { "Access-Control-Allow-Origin": "*" },
    statusCode: 200,
    body: JSON.stringify(productList)
  };

};