import productList from './productList.js';

const headers = { "Access-Control-Allow-Origin": "*" };

export const getProductById = async (event) => {
  console.log('getProductById lambda called with event: ', event);
  const { productId } = event.pathParameters;
  // emulate delay from remote URL fetch
  // suppose we'll get real URL here and not file with hardcoded values
  await new Promise(resolve => setTimeout(resolve, 2000));

  // search needed product - by id field
  const product = productList.find((prod) => prod.id === productId);

  if (!product){
    return {
        headers,
        statusCode: 404,
        body: "Target product was not found",
      };
  }

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(product),
  };

};