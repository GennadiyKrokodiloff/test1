

module.exports = {

 	connection: "authDbServer",
	
	attributes: {
	    
	    user:{
	    	model: "user"
	    },

	    client: {
	    	model: "client"
	    },

	    scope:{
	    	model: "subjectRole"
	    }
	}
}