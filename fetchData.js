var rest_url = "";

const {Client } = require('pg')
var fs = require('graceful-fs')

function stedkomm(sted, kommune,dok_id, callback) {
	var rest_url_sql = "";
	const client = new Client({
	  user: 'postgres',
	  host: '10.103.166.213',
	  database: 'stedsnavn',
	  password: 'hei',
	  port: 5432,
	})
	client.connect()

	const sqlSporring = {
		text: `SELECT sted.enh_snavn AS sted,kommune.enh_snavn AS kommune,coordinates_y, coordinates_x FROM sted, kommune WHERE sted.enh_snavn = '${sted}' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn = '${kommune}' LIMIT 1`
	}
	client.query(sqlSporring, (err, resa) => {
		if (err) {
			callback(err.stack, null)
		} else {
			if(resa.rows != ""){
				if(sted == kommune){
					rest_url_sql = `${dok_id};&q=${resa.rows[0]["kommune"]}()@${resa.rows[0]["coordinates_y"]},${resa.rows[0]["coordinates_x"]}\n`;
					fs.appendFile('C:/Users/kimknuds/Desktop/koordinater.txt', rest_url_sql ,encoding='utf8')
				} else {
					rest_url_sql = `${dok_id};&q=${resa.rows[0]["kommune"]}(${resa.rows[0]["sted"]})@${resa.rows[0]["coordinates_y"]},${resa.rows[0]["coordinates_x"]}\n`;
					fs.appendFile('C:/Users/kimknuds/Desktop/koordinater.txt', rest_url_sql ,encoding='utf8')
				}
				callback(null, rest_url_sql)
			}
			client.end()
		}
	})
}

function stringUt(stringInn) {
	rest_url += stringInn;
	console.log(rest_url)
}

function printRest() {
	console.log("----------------------rest_url-------------------------")
	console.log(dataTilDokument)
	console.log("5 sek har gått")
}

function skrivTilFiler(resr, xr, rest_urlEn) {
	if(resr.rows[xr].sted_i_kommmune != null) {
		content += "\""+rest_urlEn+"\";"
		table += "<td>"+rest_urlEn+"</td>\n"
    } else {
    	content +=";"
    	table += "<td> </td>\n"
    }


    var mineraler = resr.rows[xr].mineraler
    if(mineraler != null){
    	content += "\""+mineraler.join()+"\";"
    	table += "<td>"+mineraler.join()+"</td>\n"
    } else {
    	mineraler +=" "
    	table += "<td></td>\n"
    }

  	table += "</tr>\n"
  	content = content+"\n"

  	fs.appendFile('C:/Users/kimknuds/Desktop/table.txt', table ,encoding='utf8')
  	
  	fs.appendFile('C:/Users/kimknuds/Desktop/exportCSV.csv', content, encoding='utf8');
}

function SQLquery(){
		//fs.writeFileSync('C:/Users/kimknuds/Desktop/exportCSV.csv','dok_id;dok_navn;sted_i_kommmune;mineraler\n','utf8', 'w');
		const client = new Client({
		  user: 'postgres',
		  host: '10.103.166.213',
		  database: 'stedsnavn',
		  password: 'hei',
		  port: 5432,
		})
		client.connect()

		const query = {
		  	text: `SELECT * FROM new_data` //LIMIT 40
		}
		var testurl = "http://econym.org.uk/gmap/example_plotpoints.htm?q=Hello%20world@64.467169,12.297967&q=My%20Place@64.467003,12.296025&q=My%20Place@64.464589,12.316011&q=@63.612728,12.746092"
		var base_url = "http://econym.org.uk/gmap/example_plotpoints.htm?"

		client.query(query, (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	for( var x in res.rows ){
		  		table = "<tr>\n"
		  		content = ""

		  		var row = res.rows
		  		var dok_id = res.rows[x].dok_id
		  		content += dok_id+";"
		  		table += "<td>"+dok_id+"</td>\n"

			    var dok_navn = res.rows[x].dok_navn
			    content += dok_navn+";"
			    table += "<td>"+dok_navn+"</td>\n"


			    var sted_i_kommune = res.rows[x].sted_i_kommmune
			    

			    if(sted_i_kommune != null)
			    {
			    	// console.log(sted_i_kommune)
			    	stedikommune = sted_i_kommune.join();
			    	var patt = /\)\,/
			    	if(patt.test(stedikommune)) // Sjekker om det er flere kommuner. Eks: Oslo(),Trondheim()
			    	{
			    		stedikommune = stedikommune.split("),"); // Splitter kommunene. Eks: Oslo(),Trondheim() --> [0]=Oslo(,[1]=Trondheim()
			    		for(var i=0;i<stedikommune.length;i++) 
			    		{
			    			stedikommuneto = stedikommune[i].split("(");
			    			kommune = stedikommuneto[0];
			    			patt2 = /\,/
			    			if(patt2.test(stedikommuneto[1])) // Sjekker om kommunen har flere stedsnavn. Eks: Trondheeim(Lade,Gløshaugen)
			    			{
			    				stedikommuneto = stedikommuneto[1].split(",")
			    				for(var r=0;r<stedikommuneto.length;r++) //SPLITTE STEDER
			    				{
				    				sted = stedikommuneto[r].replace(")", "")
				    				if(sted != "" && sted != " ") // Sjekker at sted ikke er tom
				    				{
				    					stedkomm(sted,kommune,dok_id, function(err,data){
				    						if(err){
				    							console.log("ERROR: " + err)
				    							
				    						} else {
				    							//console.log("result from db is: " + data)
				    						}
				    					})
					    			} else { // 
					    				console.log("Hvis denne kommer må du finne ut hva det er")
				    				}
				    			}
			    			} else { // Kommune med 0 eller 1 stedsnavn
			    				if(stedikommuneto[1] != "" && stedikommuneto[1] != " ") {
			    					stedikommuneto = stedikommuneto[1].replace(" ","")
			    					stedikommuneto = stedikommuneto.replace(")","")
			    					//console.log(stedikommuneto + "-----komm " + kommune
			    					if(stedikommuneto == "") { // Kommune som ikke har sted. Eks: Oslo()
			    						//console.log("Kommune: " + kommune + ", dok_id: " + dok_id);
			    						stedkomm(kommune,kommune,dok_id, function(err,data){
				    						if(err){
				    							console.log("ERROR: " + err)
				    							
				    						} else {
				    							//console.log("result from db is: " + data)
				    						}
				    					})
			    					} else { // Kommune med kun et sted. Eks: Trondheim(Lade)
			    						//console.log("Kommune: " + kommune + ", stedsnavn: " + stedikommuneto + " dok_id: " + dok_id);
			    						stedkomm(stedikommuneto,kommune,dok_id, function(err,data){
				    						if(err){
				    							console.log("ERROR: " + err)
				    							
				    						} else {
				    							//console.log("result from db is: " + data)
				    						}
				    					})
			    					}
			    				} else {
			    					stedkomm(kommune,kommune,dok_id, function(err,data){
			    						if(err){
			    							console.log("ERROR: " + err)
			    							
			    						} else {
			    							//console.log("result from db is: " + data)
			    						}
			    					})
			    				}			    				
			    			}
			    		}
			    	} else { // HER SKAL DET ENKELTE KOMMUNER. EKS: Trondheim(Lade,Gløs) ELLER Trondheim()
			    		stedIKommEnKomm = stedikommune.split("(")
			    		stedIKommEnKomm[1] = stedIKommEnKomm[1].replace(")","")
			    		kommuneTo = stedIKommEnKomm[0]
			    		if(/\,/.test(stedIKommEnKomm[1])) { // En kommune med flere steder. Eks: Trondheim(Lade,Gløs)
			    			splitSted = stedIKommEnKomm[1].split(",")
			    			for(var o=0;o<splitSted.length;o++) {
			    				stedkomm(splitSted[o],kommuneTo,dok_id, function(err,data){
		    						if(err){
		    							console.log("ERROR: " + err)
		    							
		    						} else {
		    							//console.log("result from db is: " + data)
		    						}
		    					})
			    			}
			    		} else { // En kommune med ett sted. Eks: Trondheim(Lade)
			    			if(stedIKommEnKomm[1] != "" && stedIKommEnKomm[1] != " ") {
			    				stedkomm(stedIKommEnKomm[1],kommuneTo,dok_id, function(err,data){
		    						if(err){
		    							console.log("ERROR: " + err)
		    							
		    						} else {
		    							//console.log("result from db is: " + data)
		    						}
		    					})
			    			} else { // Kommune uten sted. Eks: Alta()
			    				stedkomm(kommuneTo,kommuneTo,dok_id, function(err,data){
		    						if(err){
		    							console.log("ERROR: " + err)
		    							
		    						} else {
		    							//console.log("result from db is: " + data)
		    						}
		    					})
			    			}
			    		}
			    	}
		    		// content += "\""+rest_url+"\";"
		    		// table += "<td>"+rest_url+"</td>\n"
			    } else { // sted_i_kommune er tom, så trenger ikke gjøre noe/legge inn blankt i databasen
			    	// content +=";"
			    	// table += "<td> </td>\n"
			    }

			    // skrivTilFiler(res, x, rest_url)
		  	}
		  	// t = setTimeout(function(){ printRest() }, 5000)
		  }
		  client.query('SELECT COUNT(dok_id) FROM new_data',(err,res) =>{
		  	console.log("Number of documents scanned: "+res.rows[0].count)
		  })
		  client.end()
		})
		//t = setTimeout(function(){ printRest() }, 500)
}

SQLquery()