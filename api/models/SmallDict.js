/**
* SmallDict.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  types: {
  },
  tableName:"md_small_dict",
  attributes: {
  	  	
  	  smallDictId:{
  			primaryKey: true,
        autoIncrement: true,
  			type:"integer",
  			columnName:"small_dict_id"
  		},

      dictType:{
        model: "dictType",
        columnName: "dict_type_id",
      },

		  key:{
  			type: "integer",
  			required: true,
  		},

  		value:{
  			type: "string",
  			size: 100,
  			required: true,
  		},

  		sort:{
  			type: "integer",
  			required: true
  		},
  }
};

