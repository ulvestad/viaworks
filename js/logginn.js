function checkCredentials(){
	var xhr = new XMLHttpRequest();
	var url_login = "http://viaworks.dmf.int/RestService/4/api/Login/Forms/Session";
	var user = document.getElementById("user").value
	var pass = document.getElementById("pass").value

	var payload = {"IsPersistent":'true',"Credentials":[{"Name":"windowsusername","Value":"" + user + ""},{"Name":"windowspassword","Value":"" + pass + ""},{"Name":"windowsdomain","Value":"dmf"}]}

	xhr.open('POST', url_login, true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.withCredentials = true;
	xhr.onreadystatechange = function () {
	    // do something to response
	    console.log("asdsad")

	    console.log(this.status)
	    if(this.status == 200) {
	    	//console.log("Printer inni xhr.onload function")
	    	if(this.responseText){
	    		var json = JSON.parse(this.responseText)
	    		var auth_cookie = ".ASPXAUTH="+json["Data"]["AuthCookie"]+";"
		    	document.getElementById("user").innerHTML = "Bruker: " + json["Data"]["UserDisplayName"]
				document.cookie = auth_cookie;
				Cookies.set('.ASPXAUTH', json["Data"]["AuthCookie"], { path: '/' });
				
				//user authentication successfull

				document.getElementById("loader").style.visibility= "hidden";
				document.getElementById("loader-container").style.visibility= "hidden";
				document.getElementById("load-text").style.visibility= "hidden";

	    	}
	    }
	};
	xhr.send(JSON.stringify(payload));
	console.log(xhr.send)
}