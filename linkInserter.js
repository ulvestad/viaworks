function lagreData(sted, kommune, dok_id) {
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
				rest_url_sql = `&q=${resa.rows[0]["kommune"]}(${resa.rows[0]["sted"]})@${resa.rows[0]["coordinates_y"]},${resa.rows[0]["coordinates_x"]}`;
		}
		client.end()
	})
}

function SQLquery()
{
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
		text: `SELECT * FROM new_data ORDER BY sted_i_kommmune ASC LIMIT 20` //LIMIT 40
	}
	// callback
	var testurl = "http://econym.org.uk/gmap/example_plotpoints.htm?q=Hello%20world@64.467169,12.297967&q=My%20Place@64.467003,12.296025&q=My%20Place@64.464589,12.316011&q=@63.612728,12.746092"
	var base_url = "http://econym.org.uk/gmap/example_plotpoints.htm?"

	client.query(query, (err, res) => {
		if (err) {
			console.log(err.stack)
		} else {
			for( var x in res.rows )
			{
		  		//rest_url = "";
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
			    	// console.log(sted_i_kommune.join())
			    	stedikommune = sted_i_kommune.join();
			    	var patt = /\)\,/
			    	if(patt.test(stedikommune)) // 2 ELLER FLERE KOMMUNER
			    	{
			    		//console.log(stedikommune)
			    		stedikommune = stedikommune.split("),");
			    		//console.log(stedikommune.length)
			    		for(var i=0;i<stedikommune.length;i++) 
			    		{
			    			//console.log(stedikommune[i])
			    			stedikommuneto = stedikommune[i].split("(");
			    			// kommune = stedikommune[0];
			    			//console.log(stedikommuneto)
			    			kommune = stedikommuneto[0];
			    			patt2 = /\,/
			    			//console.log(kommune)
			    			if(patt2.test(stedikommuneto[1])) //KOMMUNE MED FLERE ENN 1 STEDSNAVN
			    			{
			    				stedikommuneto = stedikommuneto[1].split(",")
			    				
			    				//console.log(stedikommuneto.join())
			    				for(var r=0;r<stedikommuneto.length;r++) 
			    				{
			    					// console.log(stedikommuneto[r])
				    				sted = stedikommuneto[r].replace(")", "")
				    				if(sted != "" && sted != " ")
				    				{
				    					//function lagreData()
					    			} else {
				    					//HER ER KOMMUNENE UTEN STED
				    				}
				    			}
			    			} else {
			    				// KUN ETT STED I KOMMUNEN
			    				//console.log("ETT STEDSNAVN: "+ stedikommuneto[1].replace(")",""))
			    			}
			    		}
			    	} else {
			    		// HER SKAL ENKELTOBJEKTER
			    	}
			    	// console.log(dataUt)
		    		// content += "\""+rest_url+"\";"
		    		// table += "<td>"+rest_url+"</td>\n"
			    } else {
			    	// content +=";"
			    	// table += "<td> </td>\n"
			    }

			    // HER SKAL DET KOMME EN INSERT SQL TING
			}
		}
	})
}