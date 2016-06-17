/**
 * ProfileController
 *
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";


const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const Q = require('q');
const _ = require('lodash');

function extractProfileFromSubject(subject){
    return ConstructSubjectService.extractObjectFromSubject(subject);
}

function constructSubjectFromProfile(profile){

  profile.subjectType = sails.config.md.subjectTypes.PERSON_PROFILE;
   
  return ConstructSubjectService
    .constructSubjectFromObject(profile);
}

function findProfile(profileId, res){

    if (!profileId){
        return res.notFound();
    }

    Subject.findOne(profileId)
    .then(subject =>{
      if (!subject) return res.notFound(profileId);  

      return res.ok( extractProfileFromSubject(subject) ) 
    })
    .catch(err => res.serverError(err))
}

module.exports = {

    find(req, res){
        const pk = actionUtil.parsePk(req) || req.user.currentSubjectId;

        findProfile(pk, res);
    },

    findOne(req, res){
        const pk = actionUtil.parsePk(req) || req.user.currentSubjectId;

        findProfile(pk, res);
    },

    update(req, res){
        const pk = req.user.currentSubjectId;
        const values = actionUtil.parseValues(req);

        let subject;
        return constructSubjectFromProfile(values)
        .then(constructedSubject => {
            subject = constructedSubject;

            if (!pk) return;

            subject.subjectId = pk;
            return Subject.update(pk, subject);
        })
        .then(updatedSubject => {
            if (!updatedSubject){
                delete subject.subjectId;
                subject.user = req.user.userId;
                return Subject.create(subject);
            }
            return updatedSubject;
        })
        .then(updatedSubjects =>{
          const updatedSubject = pk ? updatedSubjects[0] : updatedSubjects; 
          
          return EndService.ok( extractProfileFromSubject(updatedSubject) ) 
        })
        .catch(EndService.handle(res))
    },

    
}