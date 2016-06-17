/**
 * User
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt');

module.exports = {

  types: {
    phoneNumber: function(phone) {
      return phone.length === 10;
    }
  },
  attributes: {
    
    userId:{
      primaryKey:true,
      autoIncrement: true,
      type:"integer",
      columnName:"user_id"
    },
  
    name:{
      type:'string'
    },

    subjects: {
      collection: 'subject',
      via: "user"
    },

    email: {
        type: 'string',
        unique: true,
      //  email: true,
        required: true
    },

    hashedPassword: {
        protected: true,
        type: 'string',
    },

    phone: {
        type: 'string',
      //  required: true,
     //   phoneNumber: true
    },

    isMailActive:{
      type: 'boolean',
      required: true,
      defaultsTo : false
    },

    emailActivationCode:{
      protected: true,
      type: 'string',
    },

    isPhoneActive:{
      type: 'boolean',
      required: true,
      defaultsTo : false,
    },

    phoneActivationCode:{
      protected: true,
      type: 'number',
    },

    // @TODO: временно тут только один, нужно добавлять табличку
    socialProfileId:{
      type: 'string'
    },
    // название соц провайдера (facebook)
    socialProviderName:{
      type: 'string'
    },

    // который создал пользователя
    client: {
      model: 'client',
      columnName: 'client_id',
      required: true
    }
    // No need to override toJSON method as protected attribute ready
    // toJSON: function() {
  },

  beforeCreate: function(values, next){
    // 
      values.emailActivationCode = UtilsService.uid(32);
      values.phoneActivationCode = UtilsService.uid(5);
      values.isMailActive = false;
      values.isPhoneActive = false;

    // выдумаю пароль если не указан (авторизация через соц сеть)
    if (!values.password){
      values.password = UtilsService.uid(16);  
    }

    //необходимо для хеширования пароля.
      bcrypt.hash(values.password, 10, function(err, hash) {
        if(err) return next(err);

        values.hashedPassword = hash;
        
        delete values.password;
        next();
      

    });
    
  }

};
