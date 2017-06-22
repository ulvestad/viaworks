const {Client } = require('pg')


function SQLquery(){
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
	  	text: 'SELECT * FROM data LIMIT 1'
	}

	// callback
	client.query(query, (err, res) => {
	  if (err) {
	    console.log(err.stack)
	  } else {
	  	//console.log(res)
	  	//console.log(res.rows[0])
	  	for( var x in res.rows ){
	  		var row = res.rows
	  		var dok_id = res.rows[x].dok_id
		    var dok_navn = res.rows[x].dok_navn
		    var datoer = res.rows[x].datoer
		    var stedsnavn = res.rows[x].stedsnavn
		    var kommune = res.rows[x].kommunenr
		  	var mineraler = res.rows[x].mineraler
	  	}
	  	
	    
	  	console.log(row)
	  	console.log(dok_id, dok_navn, datoer, stedsnavn, kommune, mineraler)
	  }
	  client.end()
	})
}

SQLquery()
// promise
//client.query(query)
//  .then(res => console.log(res.rows[0]))
//  .catch(e => console.error(e.stack))