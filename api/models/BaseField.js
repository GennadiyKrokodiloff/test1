/**
* BaseField.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	tableName:"md_base_field",
	  types: {
	    requireDictFieldType: function(dictType) {
	      return !dictType || this.fieldType === "dict";
	    }
  	},
	attributes: {

		baseFieldId:{
			primaryKey:true,
			autoIncrement: true,
			type:"integer",
			columnName:"base_field_id"
		},

		name:{
			type:"string",
			size: 20,
			required: true
		},

		label:{
			type:"string",
			size: 30,
			required: true
		},

		fieldType:{
			type: "string",
			required: true,
			enum:["string", "number","date", "bool", "dict"],        
			columnName:"field_type"
		},

		dictType:{
			model:"DictType",
			columnName:"dict_type",
			requireDictFieldType: true
		},

		isRequired:{
  			type:"boolean",
  			required:true,
  			defaultsTo:false,
  			columnName:"is_required"
  		},

  		identifyRequired:{
  			type:"boolean",
  			required:true,
  			defaultsTo:false,
  			columnName:"identify_required"
  		}
	}
};
