const {Client } = require('pg')
var fs = require('fs');


function SQLquery(){
		fs.writeFileSync('C:/Users/simulves/Desktop/github/viaworks/exportCSV.csv','dok_id;dok_navn;datoer;stedsnavn;kommune;mineraler\n','utf8', 'w');
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
		  	text: `SELECT * FROM data` //LIMIT 40
		}
		// callback
		client.query(query, (err, res) => {
		  if (err) {
		    console.log(err.stack)
		  } else {
		  	//console.log(res)
		  	//console.log(res.rows[0])
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
			    var datoer = res.rows[x].datoer
			    if(datoer != null){
			    	content += "\""+datoer.join()+"\";"
			    	table += "<td style=\"width:15%\">"+datoer.join()+"</td>\n"
			    }
			    else{
			    	content +=";"
			    	table += "<td style=\"width:15%\"> </td>\n"
			    }
			    var stedsnavn = res.rows[x].stedsnavn
			    if(stedsnavn != null){
			    	content += "\""+stedsnavn.join()+"\";"
			    	table += "<td>"+stedsnavn.join()+"</td>\n"
			    }
			    else{
			    	stedsnavn +=";"
			    	table += "<td></td>\n"
			    }
			    var kommune = res.rows[x].kommunenr

			    if(kommune != null){
			    	content += "\""+kommune.join()+"\";"
			    	table += "<td>"+kommune.join()+"</td>\n"
			    }
			    else{
			    	content +=";"
			    	table += "<td></td>\n"
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
			  	fs.appendFile('C:/Users/simulves/Desktop/table.txt', table ,encoding='utf8')
			  	
			  	fs.appendFile('C:/Users/simulves/Desktop/github/viaworks/exportCSV.csv', content, encoding='utf8');
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