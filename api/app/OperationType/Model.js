/**
* OperationType.js
*
* @description :: Справочник типов операций, напр. чтение\редактирование\удаление
*/

module.exports = {

  tableName:"md_operation_type",
  attributes: {

  		operationTypeId:{
  			primaryKey:true,        
  			type:"string",
  			size: 20,
        columnName:"operation_type_id"
  		},

      title:{
        type:"string",
        size: 50,
        required: true
      }
  }
};
