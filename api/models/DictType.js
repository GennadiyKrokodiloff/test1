/**
* DictType.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  types: {
    sourceFormat: function(source){
        return !source
            // @TODO: check source format
            // will be like { type: 'sql', table: 'city', key: 'city_id', value: 'city_name' } 
            || true;
    },
  },
  tableName:"md_dict_type",
  attributes: {

        dictTypeId:{
            primaryKey:true,
            autoIncrement: true,
            type:"integer",
            columnName:"dict_type_id"
        },

        ownerClientId:{
            model: "client",
            columnName:"owner_client_id",            
        },

        name: {
            type:"string",
            required: true
        },

        title: {
            type:"string",
            required: true
        },

        source:{
            type: "json",
        }

  }
};

