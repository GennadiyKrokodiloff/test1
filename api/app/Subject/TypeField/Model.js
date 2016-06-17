/**
* SubjectTypeField.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName:"md_subject_type_field",
  attributes: {
  		subjectTypeFieldId:{
  			primaryKey:true,
        autoIncrement: true,
  			type:"integer",
  			columnName:"subject_type_field_id"
  		},

      baseField:{
        model:"baseField",
        columnName:"base_field_id"
      },

  		name: {
  			type:"string",
  			size: 20,
  		},

      label:{
        type:"string",
        size: 30
      },
      
  		subjectType:{
  			model:"subjectType",
  			columnName:"subject_type_id"
  		},

  		fieldType:{
  			type: "string",
  			enum:["string", "number","date", "bool", "dict"],        
  			columnName:"field_type"
  		},

  		isRequired:{
  			type:"boolean",
  			defaultsTo:false,
  			columnName:"is_required"
  		},
    
      identifyRequired:{
        type:"boolean",
        required:true,
        defaultsTo:false,
        columnName:"identify_required"
      }
  		// TODO: add format field, validation rules, etc ... 
  }
};
