const express = require('express');
require('dotenv').config();
const axios = require('axios').default;

const app = express();
const PORT = process.env.PORT || 3001

app.use(express.json());

const TTL = 120000; //difference in ms to reduce calculations

// TODO: redo to use elasticache
const cache = {};

app.all('/*', (request, response) => {
    const {originalUrl, method, body} = request;

    const recipient = originalUrl.split('/')[1];
    console.log('recipient', recipient);

    const recipientURL = process.env[recipient];
    console.log('recipientURL', recipientURL);
    if (recipientURL) {
        const axiosConfig = {
            method: method,
            url: `${recipientURL}`,
            ...(Object.keys(body || {})).length > 0 && {data: body},
        }

        console.log('axiosConfig', axiosConfig);

        // managing cache
        if (recipient === 'products' && cache.products){
            var diff = Date.now() - cache.products.timeStamp;
            if(diff > TTL){
                delete cache.products;
            } else {
                response.json(cache.products.data);
            }
        }

        axios(axiosConfig).then((res) => {
            console.log('response from recipient:', res.data)
            if(recipient === 'products' && !cache.products) {
                cache.products = {timeStamp: Date.now(), data: res.data};
            }
            response.json(res.data);
        }).catch((err) => {
            console.error('axios failed with error:', JSON.stringify(err));

            if(err.response) {
                const {status, data} = err.response;
                response.status(status).json(data);
            }
        })
    } else {
        response.status(502).json({error: 'Cannot process request'});
    }
})

app.listen(PORT, () => {
    console.log(`bff-service listening on PORT ${PORT}`);
})

