// Вспомагательный сервис для превращения объектов типа профиль\флп\юрлицо в сабжекты

module.exports = {

    extractObjectFromSubject(subject){
      const object = _.assign({
        subjectId: subject.subjectId,
        ident: subject.ident,
        subjectType: subject.subjectType,

        identifyState: subject.identifyState,
        identifyMethod: subject.identifyMethod,
        identifyStateDate: subject.identifyStateDate,

      }, subject.data);

      return object;
    },

    isDataEmpty(data){
      return typeof data === 'undefined' 
            || typeof data === 'null'
            || (data === '');
    },

    // sourceObject={subjectType, ident, subjectId, ...subjectFields}
    constructSubjectFromObject(sourceObject){

        function isWrongDataType(data, dataType){
          return false;
          // @TODO: rewrite me!
          // return !(dataType === 'string' && typeof data === dataType)
          //   || !(dataType === 'number' &&  typeof data === dataType)
          //   || !(dataType === 'bool' && typeof data === 'boolean');

        }

        return SubjectTypeField.find({subjectType: sourceObject.subjectType})
        .populate('baseField')
        .then(subjectTypeFields => {

            // @TODO: validate fields
            const subject = {
              subjectId: sourceObject.subjectId,
              ident: sourceObject.ident,
              subjectType: sourceObject.subjectType,
              data: {},       
            };
            const validationErrors = [];

            subjectTypeFields.forEach(field => {

              const overridenField = _.merge(field, field.baseField || {}, (a, b)=> a || b);          
              delete overridenField.baseField;

              // @TODO: полноценную валидацию сделать

              const isEmpty = this.isDataEmpty(sourceObject[overridenField.name]);
              if (overridenField.isRequired && isEmpty ){
                validationErrors.push({field: overridenField.name, validate: 'required'});
              }

              if (!isEmpty && isWrongDataType()){
                validationErrors.push({field: overridenField.name, 
                  validate: overridenField.fieldType + ' required'});                
              }

              subject.data[overridenField.name] = sourceObject[overridenField.name];          
            });

            if (validationErrors.length){
              return EndService.badRequest({validationErrors});
            }

            delete subject.user; 

            return subject;
        });
    },


    // по subjectTypeId вернёт промис с объектом типа профиль, компания, юрлицо
    constructMetaObjectBySubjectType(subjectTypeId){

      return SubjectTypeField.find({subjectType: subjectTypeId})
        .populate('baseField')
        .then(subjectTypeFields => {

            const metaObj = {
              subjectId: 'ID',
              subjectType: subjectTypeId       
            };

            subjectTypeFields.forEach(field => {

              const overridenField = _.merge(field, field.baseField || {}, (a,b)=> a || b);         
              delete overridenField.baseField;

              metaObj[overridenField.name] = {
                fieldType: overridenField.fieldType,
                req: overridenField.isRequired,
                label: overridenField.label,
                group: overridenField.group
              };          
            });

            return metaObj;
        });
  },

  getFieldsMergedWithBaseBySubjectType(subjectType){
      return SubjectTypeField
      .find({ subjectType })
      .populate('baseField')
      .then(fields =>{
        if (!fields.length){
          return EndService.notFound();
        }

        const mergedFields = fields.map(field => {
          const mergedField = _.merge(field, field.baseField || {}, (a,b)=> a || b);
          delete mergedField.baseField;

          return mergedField;
        });

        return mergedFields;
      });

  }

} 