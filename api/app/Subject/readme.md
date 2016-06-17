!!!!Тут есть и стандартные круд и методы!!!!!
----------------


## GET subject/waitForIdentify
###RESPONCE:
```js
	[
		{
			...companyFields OR ...profileFields
		},
	]
```
### Note
Возвращает сабжекты ожидающие идентификации


## PUT subject/setIdentifyState/:subjectId

### DATA:
```js
{ 
	identifyState: 1|2|3|4, // состояние идентфикации
	identifyMethod  // метод, которым выполняется идентификация (обязателен только при установке состояния TO_VERIFY)
}

```

### RESPONCE:
```js
{
	...subjectFields // возвращает сабжект
}
```
### Note
Установить состояние идентификации identifyState одно из public/Dictionary/getIdentifyStateType
identifyMethod - один из public/Dictionary/getIdentifyMethodType



## GET subject/checkIdentifyReady/:subjectId

### RESPONCE:
```js
{
  state // состояние готовности 
  subject // идентифицируемый сабж 
  emptyRequiredFields // массив описания пустых требуемых для идентификации, но незаполненых полей
}
```
### Note
	Проверка готов ли сабжект к идентификации, state принимает одно из значений  
```js
	checkIdentifyReadyResultState = {
	  ALREADY_VERIFIED:'ALREADY_VERIFIED',
	  IDENTIFY_DENIED:'IDENTIFY_DENIED',
	  READY:'READY'
	}
```