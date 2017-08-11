const {Client } = require('pg')
var fs = require('graceful-fs')


fs.writeFileSync('C:/Users/kimknuds/Desktop/exportCSV.csv','dok_navn;sted_i_kommmune;mineraler\n','utf8', 'w');
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
  	text: `SELECT * FROM new_data ORDER BY dok_id ASC` //LIMIT 40
}

client.query(query, (err, res) => {
	if (err) {
	console.log(err.stack)
	} else {

		for( var x in res.rows ){
			table = "<tr>\n"

			content = ""
			var row = res.rows

	    var dok_navn = res.rows[x].dok_navn
	    content += dok_navn+";"
	    table += "<td>"+dok_navn+"</td>\n"


	    var sted_i_kommune = res.rows[x].sted_i_kommmune
		if(sted_i_kommune != null){
	    	content += "\""+sted_i_kommune.join()+"\";"
	    	table += "<td>"+sted_i_kommune.join()+"</td>\n"
	    } else {
	    	sted_i_kommune +=" "
	    	table += "<td></td>\n"
	    }


	    var link = res.rows[x].link
	    var randomLetters = ""
	    for (i = 0; i < 5; i++) {
	    	 randomLetters += ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ').split('')[(Math.floor(Math.random() * 52 ))];
	    }
		if(link != null){
	    	content += "\""+link+"\";"
	    	table += "<td style=\"width: 35%;\"> <a target=\"_blank\" href=\" "+link+" \">goo.gl/"+randomLetters+"</a> <div class=\"box\"\"></div></td>\n"
	    } else {
	    	link +=" "
	    	table += "<td style=\"width: 35%;\"> no existing link </td>\n"
	    }


	  	table += "</tr>\n"
	  	content = content+"\n"
	  	fs.appendFile('C:/Users/kimknuds/Desktop/table.txt', table ,encoding='utf8')
	  	fs.appendFile('C:/Users/kimknuds/Desktop/exportCSV.csv', content, encoding='utf8');
		}

	}
	client.query('SELECT COUNT(dok_id) FROM new_data',(err,res) =>{
		console.log("Number of documents scanned: "+res.rows[0].count)
	})
	client.end()
})
