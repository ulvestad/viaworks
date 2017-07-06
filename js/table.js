window.onload = function(){

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

};

function fillTable() {
	//console.log("Du har trykket på submit")
	document.getElementById("loader").style.visibility= "visible";
	document.getElementById("load-text").style.visibility= "visible";
	document.getElementById("load-text").innerHTML= "Søker...";

	var xhr = new XMLHttpRequest();
	var text = document.getElementById("textSearch").value;
	if(text == "") { text = "*" }
	console.log("Tekst: " + text)
	var url_search = `http://viaworks.dmf.int/RestService/4/api/Search?q=${text}%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=25&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags=`


  	xhr.open('GET', url_search, true);
 	xhr.withCredentials = true;
	
	xhr.onreadystatechange = function () {
	    if(this.status == 200) {
	    	document.getElementById("loader").style.visibility= "hidden";
	    	document.getElementById("load-text").style.visibility= "hidden";
	    	if(this.responseText){
	    		var json = JSON.parse(this.responseText)
	    		document.getElementById("tbody").innerHTML="";
				var datahits = json["Data"]["Hits"];
				for(var i=0;i<datahits.length;i++) {
					var table = document.getElementById("tbody");

					var row = table.insertRow(0);

					var cell2 = row.insertCell(0);
					var cell1 = row.insertCell(1);


					var strLink = "http://viaworks.dmf.int/RestService/4/api/" + datahits[i]["Link"]["Download"];

					cell2.innerHTML = "<p style=\"width:5px !important;opacity:0.0;\">" + i + "<p>";

					cell1.innerHTML = "<p id=\"cellHead\"> <img src=\"grafikk/barbrown.png\" style=\"width:10px\"> " +datahits[i]["Name"]+"</p>";
					cell1.innerHTML += "<hr id=\"cellHR\">"
					cell1.innerHTML += datahits[i]["DocumentId"];
					cell1.innerHTML += "<br> <a href='" + strLink + "' download>Last ned dokumentet";
					cell1.innerHTML += "<br> Treff nr: " + i + "";
					console.log("Skriver ut rad nr: " + i)
				}
				//console.log("Test")
	    		test();
	    	}
	    }
	};
	xhr.send();


}