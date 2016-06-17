/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling auth requests.
 */

var passport = require('passport');

module.exports = {


    // https://developers.facebook.com/docs/
    // https://developers.facebook.com/docs/reference/login/
    facebook(req, res) {
        passport.authenticate('facebook', { failureRedirect: '/login', scope: ['email'] }, 
            (err, user) => {
              if (err || !user || !user.userId) {

                res.redirect('/');                
                return;
              }

              req.logIn(user, 
                (err) => {
                if (err) {
                  return res.serverError(err);;
                }

                if (req.session && req.session.returnTo){
                    res.redirect(req.session.returnTo);
                    return;
                }

                res.redirect('/');
                return;
              });

        })(req, res);
    },

    linkedin(req, res) {
        
        passport.authenticate('linkedin', { failureRedirect: '/login' }, 
            (err, user) => {
                
                // console.log("linkedin");
                // console.log("err - " + err);
                // console.log("err - " + user);
              if (err || !user || !user.userId) {

                res.redirect('/');                
                return;
              }

              req.logIn(user, 
                (err) => {
                if (err) {
                  return res.serverError(err);;
                }

                if (req.session && req.session.returnTo){
                    res.redirect(req.session.returnTo);
                    return;
                }

                res.redirect('/');
                return;
              });

        })(req, res);
    },

    login(req,res){

        passport.authenticate(
            'local',
            function(err, user, info)
            {
                if ((err) || (!user))
                {
                    res.redirect('/login');
                    return;
                }
                // use passport to log in the user using a local method
                req.logIn(
                    user,
                    function(err)
                    {
                        if (err)
                        {
                            res.redirect('/login');
                            return;
                        }
                        res.redirect('/');
                        return;
                    }
                );
            }
        )(req, res);
    },

    logout(req,res){
        req.logout();
        res.ok({});
    }
 
};
