function checkCredentials(){
	document.getElementById("loader-container-login").style.visibility = "visible";
	document.getElementById("loader-login").style.visibility = "visible";
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
	    if(this.status == 200) {
	    	if(this.responseText){
	    		xhr.onload =function(){
		    		var json = JSON.parse(this.responseText)
		    		var auth_cookie = ".ASPXAUTH="+json["Data"]["AuthCookie"]+";"
			    	document.getElementById("user").innerHTML = "Bruker: " + json["Data"]["UserDisplayName"]
			    	//saveCookie(auth_cookie)
			    	var loc = window.location.pathname;
					var dir = loc.substring(0, loc.lastIndexOf('/'));
					console.log(dir+"/arkiv_sok.html")

					setTimeout(function(){ location.href="file:///" + dir+"/arkiv_sok.html"; }, 1200);

				};
				//user authentication successfull

				// document.getElementById("loader").style.visibility= "hidden";
				// document.getElementById("loader-container").style.visibility= "hidden";
				// document.getElementById("load-text").style.visibility= "hidden";

	    	}
	    } else if (this.status == 401) {
	    	console.log(this.status)
	    	document.getElementById("loader-container-login").style.visibility = "hidden";
			document.getElementById("loader-login").style.visibility = "hidden";
	    	document.getElementById("innlogging_feilet").innerHTML = "Feil brukernavn eller passord";
	    } else if (this.status == 503) {
	    	document.getElementById("loader-container-login").style.visibility = "hidden";
			document.getElementById("loader-login").style.visibility = "hidden";
	    	document.getElementById("innlogging_feilet").innerHTML = "Tjenesten er utilgjengelig. Prøv igjen senere";
	    }
	};
	xhr.send(JSON.stringify(payload));
}

function guest(){

	document.getElementById("user").value = "kimknuds"
	document.getElementById("pass").value = "Jalla9012"

}