/**
 * SubjectController
 *
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
'use strict';

var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
var Q = require('q');

module.exports = {

	populateRoles: function (req, res) {

		var subjId = actionUtil.requirePk(req);

		SubjectRole.find({subject:subjId})
		.populate('subject')
		.populate('delegator')
		.populate('role')
		// populate each subject subjectRole
		.exec( function (err, data){
			if (err)
				res.serverError(err);

			return res.json(data);

		});

		
    },


	// PUT subject/setIdentifyState/:subjectId
	// { identifyState, identifyMethod  }
    setIdentifyState(req, res){
        const subjectId = actionUtil.requirePk(req);
        const values = actionUtil.parseValues(req);

    	Q(1)
    	.then(()=>{
    		if (!subjectId){
    			return EndService.badRequest('subjectId required');
    		}

  			if (typeof values.identifyState === 'undefined'){
      			return EndService.badRequest('identifyState required');
      	}

        if (! Object.keys(sails.config.md.identifyStateTypes)
          .map(key => sails.config.md.identifyStateTypes[key] )
          .some(i => i !== values.identifyState)){
            return EndService.badRequest('Bad identifyState value');
        }

        if (values.identifyState === sails.config.md.TO_VERIFY){
          // identifyMethod required
          if (!values.identifyMethod) {
              return EndService.badRequest('identifyMethod required');
          }

          if (!Object.keys(sails.config.md.identifyMethodTypes).some(i => i == values.identifyMethod)){
              return EndService.badRequest('Bad identifyMethod value');
          }
        }

    		return Subject.update({subjectId}, {
          identifyState: values.identifyState,
          identifyMethod: values.identifyMethod,
          identifyStateDate: new Date()
        })
    	})
    	.then(subjects =>{
    		if (!subjects || !subjects.length ) return EndService.notFound('Cannt find subjectId='+subjectId);

    		const obj = ConstructSubjectService.extractObjectFromSubject(subjects[0]);

    		return EndService.ok(obj);
    	})
    	.catch(EndService.handle(res))

    },

    /// GET subject/waitForIdentify
    waitForIdentify(req, res){
      // const where = actionUtil.parseCriteria(req);
      // const limit = actionUtil.parseLimit(req);
      // const skip  = req.param('page') * limit || actionUtil.parseSkip(req);
      // const sort  = actionUtil.parseSort(req);
      
      Subject.find({
      	identifyState: sails.config.md.identifyStateTypes.TO_VERIFY
      })
      .then(subjects => {
      	const objects = subjects.map(subj => {
      		const obj = ConstructSubjectService.extractObjectFromSubject(subj);

      		return obj;
      	}) 

      	return EndService.ok(objects);
      })
      .catch(EndService.handle(res));

    },
	
    /// GET subject/checkIdentifyReady/:subjectId
    checkIdentifyReady(req,res){
        const subjectId = actionUtil.requirePk(req);
        let subject;

        const checkIdentifyReadyResultState = {
          ALREADY_VERIFIED:'ALREADY_VERIFIED',
          IDENTIFY_DENIED:'IDENTIFY_DENIED',
          READY:'READY'
        }

        Subject.findOne(subjectId)
        .then(findedSubject => {
          if (!findedSubject){
            return EndService.notFound();
          }
          subject = findedSubject;

          if (subject.identifyState != sails.config.md.identifyStateTypes.NEW){
            return EndService.ok({
              state: checkIdentifyReadyResultState.ALREADY_VERIFIED,
              subject: ConstructSubjectService.extractObjectFromSubject(subject)
            });
          }

          return ConstructSubjectService.getFieldsMergedWithBaseBySubjectType( findedSubject.subjectType )
        })
        .then(mergedFields => {
          if (!mergedFields){
            return EndService.serverError('No fields for subjectType ' + subject.subjectType);
          }

          const emptyRequiredFields = mergedFields.filter(field => field.identifyRequired 
            && ConstructSubjectService.isDataEmpty(subject.data[field.name]) );

          if (emptyRequiredFields.length){
            return EndService.ok({
              state: checkIdentifyReadyResultState.IDENTIFY_DENIED,
              subject: ConstructSubjectService.extractObjectFromSubject(subject), 
              emptyRequiredFields
            });
          }

          return EndService.ok({
            state: checkIdentifyReadyResultState.READY,
            subject: ConstructSubjectService.extractObjectFromSubject(subject)
          });

        })
        .catch(EndService.handle(res));
        
    }

};
