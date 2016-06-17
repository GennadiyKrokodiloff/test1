/**
 * Client
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  connection: "authDbServer",
  attributes: {
  	
  	clientId: {
      primaryKey:true,
      type: 'string'
    },
    name: {
            type: 'string',
            required: true
        },
  	redirectURI: {
            type: 'string',
            required: true
        },
    clientSecret: 'string',
    trusted: {
        type: 'boolean',
        defaultsTo: false
    }
    
  },

  beforeCreate: function(values, next){
    values.clientId = values.clientId || UtilsService.uidLight(10);
    values.clientSecret = values.clientSecret || UtilsService.uid(30);
    next();
  }

};
