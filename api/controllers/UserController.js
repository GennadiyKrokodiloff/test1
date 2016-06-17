/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const passport = require('passport');
const Q = require('q');

const USER_ROUTE = 'user/';
const ACTIVATE_ACTION = 'activateMail/';
const ACTIVATION_LINK_MAIL_SUBJECT = 'Подтвердите регистрацию';

  function checkTrustedClient(clientId){
    return Client.findOne(clientId)
      .then(findedClient => {
        if (!findedClient){
          EndService.badRequest('Unknown client ' + clientId);
        }
         
        // @TODO: проверить является ли клиент доверенным
        // и обращается ли он с правильного юрла
        // и можно ли ему вообще пользователей создавать
        if (!findedClient.trusted){
          EndService.forbidden(`User creation forbidden to client ${clientId}`);
        }

      return findedClient;
    });
  }

  // in: user
  // out: {user, token}
  // * Запоминает выданные гранты приложению создателю
  // * Создаёт токен для входа
  // * Отправляет письмо со ссылкой-активацией
  function afterUserCreationRegistration(user){
    
    const result = {user: user, token: null};

    const newUserSubject = Subject.create({
      subjectType: sails.config.md.subjectTypes.PERSON_PROFILE,
      user: user.userId,
      name: user.name,
      data:{
        firstName: user.name,
        mail: user.email,
        cell: user.phone
      }
    });

    return newUserSubject 
    .then(newSubject =>{ 
      return user;
    })
    .then(createdUser => {        
      return UserDecision.create({client: user.client, user: user.userId})
    })
    .then(() => AccessToken.create({ userId: user.userId, clientId: user.client }) )
    .then(createdToken => {
      result.token = createdToken.token;

      const activationLink = sails.config.dino_be_world_url + USER_ROUTE + ACTIVATE_ACTION + user.emailActivationCode;

      return Q.ninvoke(sails.hooks.email,'send','activationLink',
        { activationLink },
        {
          to: user.email,
          subject: ACTIVATION_LINK_MAIL_SUBJECT,
        });
    })
    .then( () => result);
  }

module.exports = {

  populateSubjects(req, res) {
    const userId = actionUtil.requirePk(req);

    function populateSubject(subj) {
      return SubjectRole.find(
          { subject: subj.subjectId }
        )
      .populate('delegator')
      .populate('role')
      .then((roles) => {
        subj.subjectRoles = roles;
      });
    }

    User.findOne(userId)
    .populate('subjects')
    .then(user => {
      return Q.all(user.subjects.map(populateSubject))
        .then(()=> user);
    })
    .then(user => res.json(user))
    .catch(err => res.serverError(err));
  },

/**
  GET user/me
*/
  me(req, res) {
    return res.jsonx(req.user);
  },

/**
Регистрация через фейсбук

  GET user/registerViaFacebook?clientId=:clientId

*/
  registerViaFacebook(req, res){
    const clientId = req.query.clientId || req.query.state;
    
    checkTrustedClient(clientId)
    .then(client =>{

      passport.authenticate('facebook', { 
        failureRedirect: '/login', 
        scope: [ 'email' ], 
        state: clientId,
        callbackURL: sails.config.dino_be_world_url + 'user/registerViaFacebook' }, 
      (err, userProfile) => {

        if (err){
          return res.serverError(err);
        }
        
        if (!userProfile){
          return res.badRequest(); 
        }

        const ssoForClientUrl = `/oauth/authorize?client_id=${clientId}`+
                `&redirect_uri=${client.redirectURI}`+
                `&state=${sails.config.crutch.profileRoute}`+
                `&response_type=token`;

        if (userProfile.userId){
            // пользователь уже зарегистрирован
            // выдам молча токен и верну его будто он зарегался
              req.logIn(userProfile, (err) => {
                if (err) {
                  return res.serverError(err);
                }

                // переадресовываю на аутентификацию            
                return res.redirect(ssoForClientUrl); 
              });

        }

        const newUser = {
            socialProviderName: userProfile.provider,
            socialProfileId: userProfile.id,
            name: userProfile.displayName,
            client: clientId
        };

        if (userProfile.emails && userProfile.emails[0] && userProfile.emails[0].value) {
          newUser.email = userProfile.emails[0].value.trim();
        }
      
        // @TODO: handle error
        if (!newUser.email){
          return res.serverError('Пользователь не предоставил email')
        }

        return User.create(newUser)
          .then(createdUser => {

            return afterUserCreationRegistration(createdUser)  
          })        
          .then(result => {  

            // переадресовываю на аутентификацию 
            req.logIn(result.user, (err) => {
              if (err) {
                return res.serverError(err);
              }

              // переадресовываю на аутентификацию            
              return res.redirect(ssoForClientUrl); 
            });

          })
          .catch(EndService.handle(res));

      })(req, res);

    });
  },

/**
Регистрация через LinkedIn

  GET user/registerViaLinkedIn?clientId=:clientId

*/
  registerViaLinkedIn (req, res){
   
    const clientId = req.query.clientId || req.query.state; 
    
    console.log("req.query" + JSON.stringify(req.query));
   
    checkTrustedClient(clientId)
    .then(client =>{
   
      passport.authenticate('linkedin', { 
        failureRedirect: '/login', 
        scope: [ 'r_basicprofile', 'r_emailaddress' ], 
        state: clientId,
        callbackURL: sails.config.dino_be_world_url + 'user/registerViaLinkedIn' }, 
      (err, userProfile) => {
           
        if (err) {
          return res.serverError(err);
        }
        
        if (!userProfile){
          return res.badRequest(); 
        }

        const ssoForClientUrl = `/oauth/authorize?client_id=${clientId}`+
                `&redirect_uri=${client.redirectURI}`+
                `&state=${sails.config.crutch.profileRoute}`+
                `&response_type=token`;
        

        if (userProfile.userId){


            // пользователь уже зарегистрирован
            // выдам молча токен и верну его будто он зарегался
              req.logIn(userProfile, (err) => {
                if (err) {
                  return res.serverError(err);
                }

                // переадресовываю на аутентификацию            
                return res.redirect(ssoForClientUrl); 
              });

              return;
        }

        const newUser = {
            socialProviderName: userProfile.provider,
            socialProfileId: userProfile.id,
            name: userProfile.displayName,
            client: clientId
        };
        console.log('userProfile.userId' + JSON.stringify(userProfile));
        if (userProfile.emails && userProfile.emails[0] && userProfile.emails[0].value) {
          newUser.email = userProfile.emails[0].value.trim();
        }
      
        // @TODO: handle error
        if (!newUser.email){
          return res.serverError('Пользователь не предоставил email')
        }

        return User.create(newUser)
        .then(createdUser => {

          return afterUserCreationRegistration(createdUser)  
        })        
        .then(result => {  

          // переадресовываю на аутентификацию 
          req.logIn(result.user, (err) => {
            if (err) {
              return res.serverError(err);;
            }

            // переадресовываю на аутентификацию            
            return res.redirect(ssoForClientUrl); 
          });

        })
        .catch(EndService.handle(res));

      })(req, res);

    });
  },

/**
Регистрация

  user/register

  POST
  { 
    "client":"md", 
    "email":"v.pustovalov@finexpert.kh.ua", 
    "password":"1", 
    "phone":"+389999999", 
    "name":"fooo"
  }

Возвращает:
{
  token, //код авторизации, который можно обменять на токен доступа для этого пользователя
  user, // созданый пользователь
}

Должна высылать на почту email письмо со ссылкой активации, 
  при переходе по ссылке:
      активируется аккаунт
      залогинит пользователя 
      средиректит его на redirectUri
*/

  // {email, password, phone, name, client }
  register(req, res) {
    const requestValues = actionUtil.parseValues(req);
    const clientId = requestValues.client; 

    if (!clientId){
      return res.badRequest('Trusted clientId required');
    }
    
    requestValues.email = requestValues.email.trim(); 
    
    checkTrustedClient(clientId)
    .then(client =>{
      delete requestValues.userId;
      return User.create(requestValues) 
    })
    .then(user => afterUserCreationRegistration(user) )
    .then(result => {  
      return res.jsonx(result);  
    })
    .catch(EndService.handle(res));
  },

  sendActivationMail(req, res){

    const userId = actionUtil.requirePk(req);
    // @TODO: !!!!!!
    User.findOne({userId})
    .then(user =>{
          const activationLink = req.baseUrl + USER_ROUTE + ACTIVATE_ACTION + user.emailActivationCode;

          return Q.ninvoke(sails.hooks.email,'send','activationLink',
            { activationLink },
            {
              to: user.email,
              subject: ACTIVATION_LINK_MAIL_SUBJECT,
            })
      })
    .then(()=>{
      return res.jsonx(true);
    })
    .catch(err => res.serverError(err));

  },

/*
  Переход по ссылке активации юзера
    активирует аккаунт
    залогинит пользователя 
    средиректит его на страничку авторизации oauth2 что средиректит его
    на redirect_uri клиента
*/
  activateMail(req, res) {
    const emailActivationCode = actionUtil.requirePk(req);

    let user;
    let client;
    User.update({ emailActivationCode, isMailActive: false }, { isMailActive: true })
    .then(users => {
      if (!users.length)
        return EndService.notFound('User not found or activation code not valid');

      user = users[0];
      return Client.findOne(user.client)
    })
    .then(findedClient => {      
      client = findedClient;
      // call passport method
      return Q.ninvoke(req, "logIn", user)})

    .then(()=>{

          // аутентифицирую 
          req.logIn(user, (err) => {
            if (err) {
              return res.serverError(err);;
            }

            const authLink = `/oauth/authorize?client_id=${client.clientId}&redirect_uri=${client.redirectURI}`+
            `&state=${sails.config.crutch.activatedMailRoute}&response_type=token`;

            return res.redirect(req.baseUrl + authLink); 
          });      
    })
    .catch(EndService.handle(res));
  },

  // sendActivationPhoneCode(req, res){
  //   const userId = actionUtil.requirePk(req);

  //   User.findOne(userId)
  //   .then(user =>{
  //         // @TODO: implement sending activation code to phone
  //         throw Error('Not implemented');
  //     })
  //   .then(()=>{
  //     return res.jsonx(true);
  //   })
  //   .catch(err => res.serverError(err));
  // },

  // activatePhone(req, res) {
  //   const userId = actionUtil.requirePk(req);
  //   const phoneActivationCode = req.param('code');

  //   User.update({ userId, phoneActivationCode }, { isPhoneActive: true })
  //   .then(user => {
  //     return res.jsonx(user);
  //   })
  //   .catch(err => res.serverError(err));
  // },

};
