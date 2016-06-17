module.exports = function historyInterceptor(sails) {

   var HISTORY_MODEL_NAME = 'historydata';


   function setupEvent(operation, modelName ){
      return function(values, cb){

         sails.models[HISTORY_MODEL_NAME]
         .create({
            operation: operation,
            modelName: modelName,
            timestamp: new Date(),
            data: values
         }).then(
            function historyCreated(val, err){
               
               // TODO: откатить бы данные...
               if (err) return cb(err);

               cb();   
            });         
      }
   }

   return {
            
      initialize: function(cb) {

         sails.on('hook:orm:loaded', function() {

            var events = { 
               'I': 'afterCreate', 
               'U': 'afterUpdate',
               'D': 'afterDestroy'
              },
              i, j,
              modelNames = Object.keys(sails.models),
              actions = Object.keys(events),
              action, model, event;


            for ( i in modelNames ){
               model = modelNames[i];

               if (model == HISTORY_MODEL_NAME) continue;   

               for ( j in actions ) {
                  
                  action = actions[j];
                  method = events[action];
   
                  // copy-pasted from https://github.com/Dreamscapes/sails-hook-events/blob/develop/lib/events.js
                  // Start extending the models
                  sails.models[model]   // eslint-disable-line no-underscore-dangle
                  // The _callbacks property contains all the functions that are to be called for each
                  // particular lifecycle callback. This allows us to add more functionality to these
                  // callbacks without ever touching existing functions defined on the models or
                  // elsewhere. There is risk, however, because _callbacks appears to be internal property
                  // of the model and thus could change with future versions of Waterline / Sails.
                  ._callbacks[method]
                  .push(setupEvent(action, model ))
               }
            }

            return cb();

         });
      }
   };

};