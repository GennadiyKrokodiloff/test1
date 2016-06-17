/**
 * SubjectController
 *
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const Q = require('q');

function extractCompanyFromSubject(subject){
    const company = ConstructSubjectService.extractObjectFromSubject(subject);

    return company;
}

function constructSubjectFromCompany(company){

  if (company.subjectType !== sails.config.md.subjectTypes.PRIVATE_PERSON
  &&  company.subjectType !== sails.config.md.subjectTypes.COMPANY)
    throw EndService.badRequest('Wrong subject type ' + company.subjectType);

  return ConstructSubjectService
    .constructSubjectFromObject(company);

}

module.exports = {

/*
  GET public/company/

  [
    {
      ...companyFields, roles:{...roleFields}
    },
  ]
*/
    find(req, res){

      const fields = req.param('fields') ? req.param('fields').replace(/ /g, '').split(',') : [];
      const where = actionUtil.parseCriteria(req);
      const limit = actionUtil.parseLimit(req);
      const skip = req.param('page') * limit || actionUtil.parseSkip(req);
      const sort = actionUtil.parseSort(req);
      
    // у компаний(subjectX) есть физ.лица(delegator-subjY), которые работают там сотрудниками (role=employee)
    // далее что-то типа 
    // select * from subject s where 
    // s.subject_id in 
    // ( select subject_id 
    //     from subject_role sr 
    //     where sr.delegator = req.user.currentSubjectId )
  
      SubjectRole
      .find({ delegator: req.user.currentSubjectId })
      .then( subjectRoles =>{
        /// NO ROLES
        if (!subjectRoles.length){
            return EndService.ok([]);
        }

        return _.pluck(subjectRoles, 'subject');
       })
      .then(mySubjectIds => {
          // работает как "subject in [...]"
          where.subjectId = mySubjectIds;
          where.subjectType = [sails.config.md.subjectTypes.COMPANY, 
            sails.config.md.subjectTypes.PRIVATE_PERSON];

          return Subject.find(null, fields.length > 0 ? {select: fields} : null)
            .populate('roles')
            .where(where)
            .limit(limit)
            .skip(skip)
            .sort(sort);
       })
      .then(subjects => {
        if (!subjects || !subjects.length){
            return EndService.ok([]);
        }

        // отфильтровать чужие роли 
        subjects.forEach( subject =>{
            subject.roles = subject.roles.filter( subjectRole => subjectRole.delegator === req.user.currentSubjectId ); 
        });        

        return subjects.map(subject => {
          const company = extractCompanyFromSubject(subject); 
          company.roles = subject.roles;
          return company;
        } ); 
        
       })
      .then( companies => {
        return res.ok(companies);
       })
      .catch(EndService.handle(res)); 
    },

/**
    POST public/company
    {
    "subjectType":1,
    "lastName":"sample lastName",
    "passSeria":"sample passSeria",
    "passNum":"42",
    "passIssuedBy":"sample passIssuedBy",
    "passDate":"Wed Dec 16 2015 10:42:46 GMT+0200 (EET)",
    "bankIdent":"sample bankIdent",
    "bankName":"sample bankName"
    }
*/
    create(req, res) { 
        const values = actionUtil.parseValues(req);

        let newlyCreatedSubject;
        Q('begin async')
        .then(() =>constructSubjectFromCompany(values))
        .then(subject =>{

          delete subject.subjectId;
          subject.user = req.user;
          
          return Subject.create(subject)  
        })
        .then(subject => {
            newlyCreatedSubject = subject;

            return SubjectRole.create({
                subject: subject,
                delegator: req.user.currentSubjectId,
                role: sails.config.md.roles.COMPANY_ADMIN 
            });
         })
        .then(subjectRole => {

            return res.ok( extractCompanyFromSubject(newlyCreatedSubject) );
         })
        .catch(EndService.handle(res));

    },

    update(req, res){
        const pk = actionUtil.requirePk(req);
        const values = actionUtil.parseValues(req);

        constructSubjectFromCompany(values)
        .then(subject =>{
          subject.subjectId = pk;
          return Subject.update(pk, subject);
        })
        .then(subject =>{
          if (!subject){
            EndService.notFound(res);
          }
          return res.ok( extractCompanyFromSubject(subject) ) 
        })
        .catch(EndService.handle(res))
    },

    ////////
    //  get public/company/1
    //  { ...companyFields, employees: [ { ...profileFields, role: { name: (string), roleId: 3 } } ]}
    //
    findOne(req, res){
        const pk = actionUtil.requirePk(req);

        let company;
        let subjectRoles;
        

        Subject
        .findOne(pk)
        .where({subjectType: [
            sails.config.md.subjectTypes.COMPANY, 
            sails.config.md.subjectTypes.PRIVATE_PERSON]
        })
        .then( subject => {
          if (!subject) return EndService.notFound(); 

          company = extractCompanyFromSubject(subject); 
          
          return SubjectRole
          .find({subject: subject.subjectId, role: sails.config.md.roles.EMPLOYEE_ROLES })
          .populate('delegator')
          .populate('role');
          })
        .then(findedRoles =>{
          
          if (!findedRoles){
            company.employees = [];
            return EndService.ok(company)
          }

          subjectRoles = findedRoles;

          // найдём имэйлы делегатов
          const delegatorsUsersIds =  subjectRoles.map(dr => dr.delegator.user );

          return User.find(delegatorsUsersIds);
        })
        .then(users => {

          company.employees = subjectRoles.map(sr => {
              const empl = ConstructSubjectService.extractObjectFromSubject(sr.delegator);
              
              empl.user = users.filter(user => user.userId === sr.delegator.user )[0];
              empl.subjectRoleId = sr.subjectRoleId;
              empl.status = sr.status;
              empl.role = sr.role;
              return empl;
            });

          return EndService.ok(company);
        })
        .catch(EndService.handle(res));
    },

    ////////
    //  post public/company/addEmployee
    //  req: { subjectId, emails: [ email1, email2] }
    //  res: [ { ...profileFields, role: { name: (string). roleId: } } ]
    addEmployee(req, res){
      const values = actionUtil.parseValues(req);
      const companySubjectId = values.subjectId;
      
      let company;
      let newEmployeeRole;
      let findedUsersIds;
      let existingCompanyEmployees;
      let userProfileSubjects;
      let resultEmployees;

      Subject.findOne(companySubjectId)
      .then(subj =>{
        if (!subj) return EndService.notFound('Not such company');

        company = ConstructSubjectService.extractObjectFromSubject(subj);
        return Role.findOne({roleId: sails.config.md.roles.NEW_EMPLOYEE});
      })
      .then(findedRole => {
        if (!findedRole) return EndService.serverError('Bad server bootstrap: unknown role NEW_EMPLOYEE');

        newEmployeeRole = findedRole; 
      })
      .then(() => User.find( { email: values.emails } ))
      .then(users => {
        if (!users.length) return EndService.ok([]);

        findedUsersIds = _.pluck(users, 'userId');

        return SubjectRole.find(
          {
            subject: companySubjectId,
            role: sails.config.md.roles.EMPLOYEE_ROLES
          })
      })
      .then(findedExistingEmployeeRoles =>{

        const existingEmployees = _.pluck(findedExistingEmployeeRoles, 'delegator');
        const whereFilter = {
              user: findedUsersIds,
              subjectType: sails.config.md.subjectTypes.PERSON_PROFILE
          };
        if (existingEmployees.length){
          whereFilter.subjectId = { '!': existingEmployees };
        }  

        // находим профили указаных пользователей
        // кроме тех что уже являются сотрудниками компании
        return Subject
          .find(whereFilter)
          .populate('user');
      })
      .then(findedUserProfileSubjects => {
        if (!findedUserProfileSubjects.length) return EndService.ok([]);

        userProfileSubjects = findedUserProfileSubjects;

        const newRoles = userProfileSubjects.map(userProfileSubject => {
          //  * у компаний(subjectX) есть "профили"(delegator-subjY), 
          // которые работают там сотрудниками (role=employee)
          return {
            subject: companySubjectId, 
            delegator: userProfileSubject, 
            role: newEmployeeRole };
        });

        return SubjectRole.create(newRoles);
      })
      .then(newEmployeeSubjRoles => {
        return newEmployeeSubjRoles.map(employeeSubjRoles => {
          const userProfileSubject = userProfileSubjects.filter(s => s.subjectId === employeeSubjRoles.delegator )[0]; 
          
          const empl = ConstructSubjectService.extractObjectFromSubject(userProfileSubject);
          empl.role = newEmployeeRole;
          empl.subjectRoleId = employeeSubjRoles.subjectRoleId;
          empl.status = employeeSubjRoles.status;
          
          empl.userEmail = userProfileSubject.user.email; 
          
          return empl;
        });
      })
      .then(employees => {
        resultEmployees = employees;
        
        const gotoFrontLink = sails.config.crutch.addEmployeeUrl;

        return employees.map(empl => {

          return Q.ninvoke(sails.hooks.email,'send','inviteEmployee',
            { employee: empl, company, gotoFrontLink },
            {
              to: empl.userEmail,
              subject: 'Приглашение присоединиться к компании',
            });          
        });
      })
      .then(()=>{
        return EndService.ok(resultEmployees);
      })
      .catch(EndService.handle(res))
    },

    destroy(req, res){
        // @TODO: удалять каскадно?
        const pk = actionUtil.requirePk(req);
        return res.serverError("Not implemented!");

        SubjectRole.destroy({subject: pk})
        .then(subjectRole=> {
            return Subject.destroy(pk)
        } )
        .then(subject => {
            return res.ok();
        })
        .catch(err => res.serverError(err) );
    },
    
    
};