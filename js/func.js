function myFunc() {
	//console.log("Du har trykket på submit")
	document.getElementById("loader").setAttribute("class", "loader");
	var xhr = new XMLHttpRequest();
	var url_login = "http://viaworks.dmf.int/RestService/4/api/Login/Forms/Session";
	var payload = {"IsPersistent":'true',"Credentials":[{"Name":"windowsusername","Value":"kimknuds"},{"Name":"windowspassword","Value":"Jalla9012"},{"Name":"windowsdomain","Value":"dmf"}]}


	xhr.open('POST', url_login, true);
	xhr.setRequestHeader('Content-type', 'application/json');
	xhr.withCredentials = true;
	xhr.onreadystatechange = function () {
	    // do something to response
	    if(this.status == 200) {
	    	//console.log("Printer inni xhr.onload function")
	    	if(this.responseText){
	    		var json = JSON.parse(this.responseText)
	    		
	    		var auth_cookie = ".ASPXAUTH="+json["Data"]["AuthCookie"]+";"
		    	document.getElementById("user").innerHTML = "Bruke: " + json["Data"]["UserDisplayName"]
				document.cookie = auth_cookie;
				Cookies.set('.ASPXAUTH', json["Data"]["AuthCookie"], { path: '/' });

				var text = document.getElementById("textSearch").value;
				if(text == "") { text = "*" }
				console.log("Tekst: " + text)
				var url_search = `http://viaworks.dmf.int/RestService/4/api/Search?q=${text}%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=20&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags=`

		      	xhr.open('GET', url_search, true);
		     	xhr.withCredentials = true;
				
				xhr.onreadystatechange = function () {
					document.getElementById("loader").setAttribute("class", "loaderOff");
				    if(this.status == 200) {
				    	var tableid = document.getElementById("MYtable");
				    	if(tableid) {
				    		tableid.setAttribute("id", "MYtablee");
				    	}
				    	if(this.responseText){
				    		var json = JSON.parse(this.responseText)
				    		document.getElementById("tbody").innerHTML="";
							var datahits = json["Data"]["Hits"];
							for(var i=0;i<datahits.length;i++) {
								var table = document.getElementById("tbody");
								var row = table.insertRow(-1);
								var cell1 = row.insertCell(0);
								var cell2 = row.insertCell(1);
								var cell3 = row.insertCell(2);
								var cell4 = row.insertCell(3);

								var strLink = "http://viaworks.dmf.int/RestService/4/api/" + datahits[i]["Link"]["Download"];

								cell1.innerHTML = i;
								cell2.innerHTML = datahits[i]["DocumentId"];
								cell3.innerHTML = datahits[i]["Name"];
								cell4.innerHTML = "<a href='" + strLink + "' download>Last ned dokumentet</a>";
							}
							document.getElementById("MYtablee").setAttribute("id", "MYtable");
				    		test()
				    	}
				    	
				    }
				    // console.log("Kjører nå MYtablee = MYtable")

				};
				xhr.send();

	    	}

	    }
	};
	xhr.send(JSON.stringify(payload));

}