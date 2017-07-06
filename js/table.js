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

function formatBytes(a,b){if(0==a)return"0 Bytes";var c=1e3,d=b||2,e=["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"],f=Math.floor(Math.log(a)/Math.log(c));return parseFloat((a/Math.pow(c,f)).toFixed(d))+" "+e[f]}

function fillTable() {
	//console.log("Du har trykket på submit")
	document.getElementById("loader").style.visibility= "visible";
	document.getElementById("load-text").style.visibility= "visible";
	document.getElementById("load-text").innerHTML= "Søker...";

	var xhr = new XMLHttpRequest();
	var text = document.getElementById("textSearch").value;
	if(text == "") { text = "*" }
	console.log("Tekst: " + text)
	var url_search = `http://viaworks.dmf.int/RestService/4/api/Search?q=${text}%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=250&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags=`

  	xhr.open('GET', url_search, true);
 	xhr.withCredentials = true;

	xhr.onreadystatechange = function () {
	    if(this.status == 200) {
	    	if(this.responseText){
	    		document.getElementById("resTable").innerHTML = "<thead><tr><th id=\"th1\"></th></tr></thead><tbody id=\"tbody\"></tbody>";
	    		var json = JSON.parse(this.responseText)
	    		document.getElementById("tbody").innerHTML="";
				var datahits = json["Data"]["Hits"];
				for(var i=0;i<datahits.length;i++) {
					var table = document.getElementById("tbody");

					var row = table.insertRow(-1);

					var cell2 = row.insertCell(0);


					var strLink = "http://viaworks.dmf.int/RestService/4/api/" + datahits[i]["Link"]["Download"];

					if(i>=10 && i<100) {
						var tall = "0000"+i;
					} else if (i<10) {
						tall = "00000"+i;
					} else if (i>=100 && i<1000) {
						tall = "000"+i;
					} else if(i>=1000 && i<10000) {
						tall = "00"+i;
					} else {
						tall = "0"+i;
					}

					var summary = datahits[i]["Summary"].substring(0,180).replace("\n","")+"...";
					var filStorrelse = formatBytes(datahits[i]["File"]["Size"],2)

					cell2.innerHTML = "<div id='tall' >" + tall + "</div><p id=\"cellHead\"> <img src=\"grafikk/barbrown.png\" id='brunFirkant'> " +datahits[i]["Name"] + "<hr id=\"cellHR\"><div id='wraps'><br><div id='venstre'>" + datahits[i]["DocumentId"] + "<br> <a href='" + strLink + "' download>Last ned dokumentet</a><br> Filstørrelse: " + filStorrelse + "</div><div id='hoyre'>" + summary + "</div></div>";
					// console.log("Skriver ut rad nr: " + i)
				}
				//console.log("Test")
	    		test()
	    		document.getElementById("loader").style.visibility= "hidden";
	    		document.getElementById("load-text").style.visibility= "hidden";
	    	}
	    }
	};
	xhr.send();


}