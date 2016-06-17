/**
* SubjectRole.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
*/

module.exports = {

	tableName: "md_subject_role",
	attributes: {

		subjectRoleId:{
  			primaryKey: true,
  			autoIncrement: true,
  			type: "integer",
  			columnName: "subject_role_id"
  		},

  		subject:{
  			model: "subject",
        columnName: "subject_id"
  		},

  		delegator:{
  			model: "subject",
        columnName: "delegator_subject_id"        
  		},

  		role:{
  			model: "role",
        columnName: "role_id"
  		},

  		customOperation: {
  			type: "json",
  			columnName: "custom_operations"
  		},

      status: {
        type: "string",
        required: true,
        defaultsTo: "0"
      }
	}

};