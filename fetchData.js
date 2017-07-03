

const {Client } = require('pg')
var fs = require('graceful-fs')


function SQLquery(){
		fs.writeFileSync('C:/Users/kimknuds/Desktop/exportCSV.csv','dok_id;dok_navn;sted_i_kommmune;mineraler\n','utf8', 'w');
		const client = new Client({
		  user: 'postgres',
		  host: '10.103.166.213',
		  database: 'stedsnavn',
		  password: 'hei',
		  port: 5432,
		})
		client.connect()

		const query = {
			//text: 'SELECT COUNT(dok_id) FROM data'
		  	text: `SELECT * FROM new_data LIMIT 10` //LIMIT 40
		}
		// callback
		var testurl = "http://econym.org.uk/gmap/example_plotpoints.htm?q=Hello%20world@64.467169,12.297967&q=My%20Place@64.467003,12.296025&q=My%20Place@64.464589,12.316011&q=@63.612728,12.746092"
		var base_url = "http://econym.org.uk/gmap/example_plotpoints.htm?"


		client.query(query, (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	//console.log(res)
		  	//console.log(res.rows[0])
		  	for( var x in res.rows ){
		  		var rest_url = "";

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
			    
			    

			    if(sted_i_kommune != null){

			    	// console.log(sted_i_kommune.join())
			    	stedikommune = sted_i_kommune.join();
			    	var patt = /\)\,/
			    	if(patt.test(stedikommune)) 
			    	{
			    		//console.log(stedikommune)
			    		stedikommune = stedikommune.split("),");
			    		// console.log(stedikommune.length)
			    		for(var i=0;i<stedikommune.length;i++) 
			    		{
			    			//console.log(stedikommune[i])
			    			stedikommuneto = stedikommune[i].split("(");
			    			// kommune = stedikommune[0];
			    			//console.log(stedikommuneto)
			    			kommune = stedikommuneto[0];
			    			patt2 = /\,/
			    			if(patt2.test(stedikommuneto[1]))
			    			{
			    				stedikommuneto = stedikommuneto[1].spli(",")
			    				for(var r=1;r<stedikommuneto.length;r++) 
			    				{
				    				sted = stedikommuneto[r].replace(")", "")
				    				if(sted != "" && sted != " ")
				    				{
				    					console.log("Sted: " + sted)
				    					console.log("Kommune: " + kommune)
				    					const client = new Client({
										  user: 'postgres',
										  host: '10.103.166.213',
										  database: 'stedsnavn',
										  password: 'hei',
										  port: 5432,
										})
										client.connect()
				    					const sqlSporring = {
				    						text: `SELECT coordinates_y, coordinates_x FROM sted, kommune WHERE sted.enh_snavn = '${sted}' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn = '${kommune}' LIMIT 1`
				    					}
				    					client.query(sqlSporring, (err, resa) => {
											if (err) {
												console.log(err.stack)
											} else {
												rest_url+= `&q=${kommune}(${sted})@`;
												//console.log("Kommune: " + kommune + ", Sted: " + sted)
												//console.log(resa.rows[0][coordinates_x])
												// console.log(rest_url)
												for(var x in resa.rows[0]) {
													//console.log(x)
													var row = resa.rows[0][x];
													rest_url+= resa.rows[0][x]+",";
													//console.log(resa.rows[0][x])
												}
											}
											console.log(rest_url)
											client.end()
				    					})
					    			}
				    				else 
				    				{
				    					//HER ER KOMMUNENE UTEN STED
				    				}
				    			}

			    			}
			    			else
			    			{
			    				// KUN ETT STED I KOMMUNEN
			    			}
			    			steder = stedikommuneto[1].split(",")
			    		}
			    	}
			    	else
			    	{
			    		// HER SKAL ENKELTOBJEKTER
			    	}


			    	content +=
			    	content += "\""+sted_i_kommune.join()+"\";"
			    	table += "<td>"+sted_i_kommune.join()+"</td>\n"
			    }
			    else{
			    	content +=";"
			    	table += "<td> </td>\n"
			    }
			    























			    var mineraler = res.rows[x].mineraler
			    if(mineraler != null){
			    	content += "\""+mineraler.join()+"\";"
			    	table += "<td>"+mineraler.join()+"</td>\n"
			    }
			    else{
			    	mineraler +=" "
			    	table += "<td></td>\n"
			    }

			  	//console.log(row)
			  	table += "</tr>\n"
			  	content = content+"\n"
			  	//console.log(content)
			  	fs.appendFile('C:/Users/kimknuds/Desktop/table.txt', table ,encoding='utf8')
			  	
			  	fs.appendFile('C:/Users/kimknuds/Desktop/exportCSV.csv', content, encoding='utf8');
		  		//console.log(dok_id, dok_navn, datoer, stedsnavn, kommune, mineraler)
		  	}
		  	
		  	
		  }
		  client.query('SELECT COUNT(dok_id) FROM data',(err,res) =>{
		  	console.log("Number of documents scanned: "+res.rows[0].count)
		  })
		  client.end()
		})
}

SQLquery()

// promise
//client.query(query)
//  .then(res => console.log(res.rows[0]))
//  .catch(e => console.error(e.stack))