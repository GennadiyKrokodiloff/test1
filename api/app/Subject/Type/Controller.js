/**
 * SubjectTypeController
 *
 * @description :: Server-side logic for managing subjecttypes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');


module.exports = {
	/// GET subjectTypeField/mergedWithBase/:subjectType
    fieldsMergedWithBase(req, res){
        const subjectType = actionUtil.requirePk(req);

    	SubjectTypeField
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

    		EndService.ok(mergedFields);
    	})
    	.catch(EndService.handle(res))

    }

};

