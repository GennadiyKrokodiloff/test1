/**
* Role.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName:"md_role",
  attributes: {

  		roleId:{
  			primaryKey:true,
        autoIncrement: true,
  			type:"integer",
  			columnName:"role_id"
  		},

  		name:{
  			type:"string",
  			size: 20,
  			required: true,
  			unique: true
  		},

  		operations:{
  			type:"json"
  		}
  }
};

