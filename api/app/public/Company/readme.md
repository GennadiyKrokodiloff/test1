# Company API

##Общие сведения

Компания - это условное названия для сущностей "Юр.лицо" и "флп", оба они, в свою очередь, подвиды сущности subject, а именно это сабжекты с subjectType=1 и subjectType=2.  
Для получения перечня полей для сущности: 
* GET subjectTypeField?where={subjectType=1}
* для тех полей, у который есть baseField и name==null, запросить названия базового поля `GET basefield`


## GET public/company

### RESPONCE
```js
	[
		{
			...companyFields,   	// поля компании 
			roles: [				// роли, которые текущий пользователь исполняет в этой компании
				{
					...roleFields 	
				}
			]
		},
	]
```
### Note
	Возвращает перечень компаний к которым относится (работает там) текущий пользователь.


## GET public/company/:subjectId

### PARAMS   
  * subjectId - идентификатор компании 

### RESPONCE
```js
  {
    subjectId, // идентификатор компании, используется для последующей работы - обновлении, идентификации и т.п.
    ident, // уникальный идентификатор, не используется сейчас, зарезервирован на будущее
    subjectType, // флп 1 или юрлицо 2 
    verifyState, // состояние идентификации, одно из значение NEW: 0, TO_VERIFY: 1, DONE: 2, REJECTED: 3
    
    ...companyFields // поля специфичные для профиля пользователя
    employees: [	// профили пользователей, которые находятся в подчинении у компании
	    {
	    	...profileFields 	
	    }
	]
  }
```
### Note

Возвращает компанию subjectId с сотрудниками


## PUT public/company/:subjectId

### PARAMS   
  * subjectId - идентификатор компании 

### DATA:
```js
{ 
	subjectType, 		// флп 1 или юрлицо 2
	...companyFields 	// все поля специфичные для компании 
}
```

### RESPONCE:
```js
{
  ...companyFields
}
```
### Note
Обновляет все поля компании

## POST public/company

### DATA:
```js
{ 
	subjectType, 		// флп 1 или юрлицо 2
	...companyFields 	// все поля специфичные для компании 
}
```

### RESPONCE:
```js
{
  ...companyFields
}
```
### Note
Добавляет новую компанию

## POST public/company/addEmployee

### DATA:
```js
{ 
	subjectId,
	emails: ["email1", "email2"] 
}
```

### RESPONCE:
```js
{
  [ // массив профилей успешно добавленных сотрудников
  	{ 
  		...profileFields, 
  		role: { ...roleFields } 
  	} 
  ]
}
```
### Note
Добавит профили с почтой указаной в emails в качестве сотрудников компании subjectId. Вернёт масив добавленных пользователей. Добавленых ранее или не найденных - не вернёт.
