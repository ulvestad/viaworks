const {Client } = require('pg')
var fs = require('graceful-fs')


fs.writeFileSync('C:/Users/simulves/Desktop/exportCSV.csv','dok_id;dok_navn;sted_i_kommmune;mineraler\n','utf8', 'w');
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
  	//console.log(res)
  	//console.log(res.rows[0])
  	for( var x in res.rows ){
  		rest_url = "";
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
	    	stedikommune = sted_i_kommune.join();
	    	var patt = /\)\,/
	    	if(patt.test(stedikommune)) 
	    	{
	    		stedikommune = stedikommune.split("),");
	    		for(var i=0;i<stedikommune.length;i++) 
	    		{
	    			stedikommuneto = stedikommune[i].split("(");
	    			kommune = stedikommuneto[0];
	    			patt2 = /\,/
	    			if(patt2.test(stedikommuneto[1]))
	    			{
	    				//KOMMUNE MED FLERE ENN 1 STEDSNAVN

	    				stedikommuneto = stedikommuneto[1].split(",")
	    				for(var r=0;r<stedikommuneto.length;r++) 
	    				{
		    				sted = stedikommuneto[r].replace(")", "")
		    				if(sted != "" && sted != " ")
		    				{	

		    					var rest_url_sql = dok_id+",";
								const client = new Client({
								  user: 'postgres',
								  host: '10.103.166.213',
								  database: 'stedsnavn',
								  password: 'hei',
								  port: 5432,
								  max:1
								})
								client.connect()
								const sqlSporring = {
									text: `SELECT sted.enh_snavn AS sted,kommune.enh_snavn AS kommune,coordinates_y, coordinates_x FROM sted, kommune WHERE sted.enh_snavn = '${sted}' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn = '${kommune}' LIMIT 1`
								}
								client.query(sqlSporring, (err, resa) => {
									if (err) {
										callback(err.stack, null)
									} else {

										rest_url_sql +=  `&q=${resa.rows[0]["kommune"]}(${resa.rows[0]["sted"]})@${resa.rows[0]["coordinates_y"]},${resa.rows[0]["coordinates_x"]}`;

									}

									client.end()
									fs.appendFile('C:/Users/simulves/Desktop/test.txt', rest_url_sql+"\n" ,encoding='utf8')
								})
			    			
			    			} 
			    			else {
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
    		content += "\""+rest_url+"\";"
    		table += "<td>"+rest_url+"</td>\n"
	    } else {
	    	content +=";"
	    	table += "<td> </td>\n"
	    }


	    var mineraler = res.rows[x].mineraler
	    if(mineraler != null){
	    	content += "\""+mineraler.join()+"\";"
	    	table += "<td>"+mineraler.join()+"</td>\n"
	    } else {
	    	mineraler +=" "
	    	table += "<td></td>\n"
	    }
	
	  	table += "</tr>\n"
	  	content = content+"\n"
	  	fs.appendFile('C:/Users/simulves/Desktop/table.txt', table ,encoding='utf8')
	  	
	  	fs.appendFile('C:/Users/simulves/Desktop/exportCSV.csv', content, encoding='utf8');
  	}

  }
  client.query('SELECT COUNT(dok_id) FROM new_data',(err,res) =>{
  	console.log("Number of documents scanned: "+res.rows[0].count)
  })
  client.end()
})


