/**
 * oauthBearer policy
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var passport = require('passport');


module.exports = function(req, res, next) {

	passport.authenticate(
	    'bearer',
	    function(err, user, info)
	    { 
	    	
	    	if ((err) || (!user))
	        {
	            res.forbidden();
	            // res.redirect('/');
	            return;
	        }

	        const token = info.token;
	        req.user = user;
        	delete req.query.access_token;

	        // AccessToken.findOne({token: info.token.token })
	        // .then(token=>{
        	if (!token){
        		return res.forbidden('Unknown token');
        	}

	        	// @TODO: решить как будем устанавливать текущего пользователя
	        	// пока так:
	        	// 	* если scope-а не было считаю, что работаем за "профиль" участника пользователя
	        	
        	if (!token.scope){
        		return Subject.findOne({
        				user: token.userId,
        				subjectType: sails.config.md.subjectTypes.PERSON_PROFILE
        		})
        		.then(subject => {
        			if (!subject){
        				// профиль ещё не создали
        				return next();
        			}

        			req.user.currentSubjectId = subject.subjectId;
        			return next();
        		});
        	}

			// 	* если токен со скоупом ...
        	// ПОДУМАТЬ КАК ОПРЕДЕЛИТЬ ТЕКУЩИЙ
        	// предположительно работаем за того, который указан в делегате записи subjectRoles
			returnSubjectRole.findOne({subjectRoleId: token.scope})
			.then(subjectRole => {
    			req.user.currentSubjectId = subject.delegator;
				req.user.currentRole = subjectRole; 
			});

        	return res.serverError('Change current user subject not implemented');
	        // })
	        // .catch(err => res.serverError(err));
            
	    }
	)(req, res);
};
