/**
 * SubjectController
 *
 * @description :: Server-side logic for managing subjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
"use strict";

const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');
const Q = require('q');



module.exports = { 

    // Вернёт данные по типу словаря
    findOne(req, res){
        // DICT TYPE
        const dictTypeId = actionUtil.requirePk(req);

        DictType.findOne(dictTypeId)
        .then(dictType =>{
            if(!dictType) return res.notFound();

            const loadSmallDict = SmallDict.find({dictType: dictType.dictTypeId}).sort('sort');
 
            function loadSqlDict(dictSourceConfig){  
                // как я понял не важно на какой модели будет осуществлён вызов
                // главное что бы адаптер был подходящим
                const model = SmallDict;                
                const whereStatement = dictSourceConfig.where ? 'where ' + dictSourceConfig.where : '';
                const orderStatement = dictSourceConfig.sort || '1';
                
                const selectDictDataSQL = `select ${dictSourceConfig.key} as key,
                 ${dictSourceConfig.value} as value
                 from ${dictSourceConfig.table}
                 ${whereStatement} 
                 order by ${orderStatement}`;

                
                return  Q.ninvoke(model, "query", selectDictDataSQL)
                    .then(result => {
                        return result.rows;
                    });
            };

            // @TODO: implement GDSN DICTIONARY 
            const loadGdsnDict = () => res.serverError('NOT IMPLEMENTED');

            const dictSource = dictType.source || { type: 'small'};
            
            let dictLoadingPromise;
            switch (dictSource.type){
                case 'small': 
                    dictLoadingPromise = loadSmallDict; 
                    break;
                case 'sql': 
                    dictLoadingPromise = loadSqlDict(dictSource); 
                    break;
                case 'GDSN': 
                    dictLoadingPromise = loadGdsnDict(); 
                    break;
            }  

            return dictLoadingPromise;
        })
        .then(dictData => {

            return res.ok(dictData);
        })
        .catch(err => res.serverError(err))

    },


    getIdentifyMethodType(req, res){
      res.ok(sails.config.md.identifyMethodTypes);
    },

    getIdentifyStateType(req, res){
      res.ok(sails.config.md.identifyStateTypes);
    }

}