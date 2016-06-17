'use strict';

module.exports = function(req, res, next) {
    const clientId = req.oauth2.client.clientId;
    const userId = req.user.userId;
    req.scope = [];

    if (typeof req.oauth2.req.scope == 'object')
        req.scope = req.oauth2.req.scope.map( i => parseInt(i) );

    if (!clientId) {
        return res.send(400, "Missing clientId parameter");
    }

    Client.findOne({
        clientId: clientId
    })
    .then(client => {
        if (!client) 
            return res.send(400, "Client not found");

        if (!client.trusted)
            return next();

        return UserDecision.find({
                user: userId,
                client: clientId,
                scope: req.scope.length == 0 ? null : req.scope 
            })
    })
    .then( userDecisions => {

        if (userDecisions.length == 0) {
            return next();
        }

        const approvedScope = _.pluck(userDecisions, 'scope'); 
       
        if (_.difference(req.scope, approvedScope).length == 0 ){
            req.trustedScope = true;
            
            req.body = req.query;
            req.body.transaction_id = req.oauth2.transactionID;
        }

        return next(); 
    })
    .catch(err => res.send(500, err.message))

}