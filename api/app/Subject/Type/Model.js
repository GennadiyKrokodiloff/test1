/**
* SubjectType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName:"md_subject_type",
  attributes: {

  		subjectTypeId:{
  			primaryKey:true,
        autoIncrement: true,
  			type:"integer",
  			columnName:"subject_type_id"
  		},

  		name: {
  			type:"string",
  			size: 20,
  			required: true,
  			unique: true
  		},

  		fields:{
  			collection: "subjectTypeField",
  			via: "subjectType"
  		}

  }
};

