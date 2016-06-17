/**
* Subject.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName:"md_subject",
  attributes: {

  		subjectId:{
  			primaryKey:true,
  			autoIncrement: true,
  			type:"integer",
  			columnName:"subject_id"
  		},

      ident:{
        type:"string",
        unique: true
      },

      name:{
        type: "string",
        size: 50
      },

  		subjectType:{
  			model: "subjectType",
  			columnName: "subject_type_id"
  		},

      roles:{
        collection: "subjectRole",
        via: "subject" 
      },

  		user: {
  			model: "user",
  			columnName: "userId"
  		},

  		data: {
  			type: "json",
  			required: true
  		},

      identifyState: {
        type: "string",
        required: true,
        defaultsTo: sails.config.md.identifyStateTypes.NEW
      },

      identifyMethod: {
        type: 'string',
        
      },

      identifyStateDate: {
        type: 'datetime',        
      }
  }
};
