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
		  	text: `ALTER TABLE data ADD COLUMN stedsnavn_i_kommune character varying(150)` //LIMIT 40
		}

		  client.query('SELECT COUNT(dok_id) FROM data',(err,res) =>{
		  	console.log("ok")
		  })
		  client.end()
		})
}

SQLquery()

// promise
//client.query(query)
//  .then(res => console.log(res.rows[0]))
//  .catch(e => console.error(e.stack))