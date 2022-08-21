
const generatePolicy = ( principalId = 'none', effect = 'Deny', resource) => (
    {
        principalId,
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: effect,
                    Resource: resource,
                }
            ],
        }
    });

const decodeToken = (token) => {
    const encodedVal = token.split(' ')[1];
    const buffer = Buffer.from(encodedVal, 'base64');
    const credArray = buffer.toString('utf-8').split("=");
    if (!(credArray && credArray.length === 2)){
        throw new Error("fail to fetch token");
    }
    return credArray;
}

export const basicAuthorizer = async (event, _, cb) => {
    console.log('basicAuthorizer lambda called with event: ', event);

    try {
        const { authorizationToken, methodArn } = event;

        if(!authorizationToken){
           return cb('Unauthorized');
        }

        const [username, password] = decodeToken(authorizationToken);

        console.log(`User: ${username}, Password: ${password}`);

        const envPassword = process.env[username];
        const effect = (envPassword && envPassword === password) ? 'Allow' : 'Deny';
        const policy = generatePolicy(username, effect, methodArn);
        cb(null, policy)

    } catch (error) {
        console.error('basicAuthorizer lambda crashed with error', error);
        cb('Unauthorized');
    }

}