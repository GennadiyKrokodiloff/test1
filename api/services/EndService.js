/**

EndService

Прерывания цепочки промисов с возратом хттп результата 

Пример использования:

    someControllerAction(req, res){
        
        // начинаем цепочку промисов       
        findSomething()
        .then(findSomethingResult =>{

            // выполняя какие-то проверки имеем возможность
            // прервать цепочку промисов и вернуть http результат с ошибкой
            if (!findSomethingResult){
                EndService.notFound('There are no "something" here');
            }

            return foo( findSomethingResult );
        })
        .then(fooCallResult =>{

            // выполняя какие-то проверки имеем возможность
            // прервать цепочку промисов и вернуть данные 
            // как-будто вызвали res.ok(fooCallResult)
            if (fooCallResult.isGoodEnough){
                EndService.ok(fooCallResult);            
            }

            return boo(fooCallResult);
        })
        .then(booCallResult =>{
            return res.ok(booCallResult);
        })
        // обрабатываем ошибки и
        // * либо успешно завершаем вызов
        // * либо возвращаем ошибку с нужным кодом
        // * либо возвращаем 500
        .catch( EndService.handle(res) );        
    }

*/

const END_SERVICE_KEY = 'END_SERVICE_KEY';

module.exports = {
    ok(payload){
        throw {END_SERVICE_KEY, code: 200, payload };
    },

    forbidden(payload){
        throw {END_SERVICE_KEY, code: 401, payload };
    },

    notFound(payload){
        throw {END_SERVICE_KEY, code: 404, payload };
    },

    badRequest(payload){
        throw {END_SERVICE_KEY, code: 400, payload };
    },

    serverError(payload){
        throw {END_SERVICE_KEY, code: 500, payload };
    },

    handle(res){
        return err => {
          if (!err.END_SERVICE_KEY){
            return res.serverError(err);
          }
            
          switch (err.code) {
            case 200: 
                return res.ok(err.payload); 
            case 400: 
                return res.badRequest(err.payload); 
            case 401: 
                return res.forbidden(err.payload); 
            case 404: 
                return res.notFound(err.payload); 
            default:
                return res.serverError(err.payload);

          }

        };
    }
}
