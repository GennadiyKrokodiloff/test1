// ТОЛЬКО ДЛЯ ТЕСТИРОВАНИЯ 
// УДАЛИТЬ ПОСЛЕ РЕАЛИЗАЦИИ АУТЕНТИФИКАЦИИ

module.exports = function(req, res, next) {

	const currentUserId = 1;
	const currentSubjectId = 1;

	User.findOne(currentUserId)
	.then(user => {
		req.user = user;
	    user.currentSubjectId = currentSubjectId;

		next();
	})

}