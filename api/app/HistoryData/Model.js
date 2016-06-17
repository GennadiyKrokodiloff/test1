/**
* HistoryData.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	tableName:"md_history_data",
	autoCreatedAt: false,
	autoUpdatedAt: false,
	attributes: {

			id:{
				primaryKey:true,
	    		autoIncrement: true,
				type:"integer",
				columnName:"history_data_id"
			},

			operation:{
				type: "string",
				size: 1,
				required: true
			},

			modelName:{
				type:"string",
				size: 20,
				required: true
			},

			timestamp:{
				type:"datetime",
				required: true
			},

			data:{
				type:"json"
			}
	}
};

