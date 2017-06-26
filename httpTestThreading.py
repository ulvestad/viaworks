#!/usr/bin/env python
import requests # $ python -m pip install requests
import json
import re
import itertools
import psycopg2
import time
import multiprocessing
from multiprocessing import Pool 
from multiprocessing.dummy import Pool as ThreadPool 


def threading(docnum):

	start_time = time.time()

	cookie = ".ASPXAUTH=84B4AC374CC0BD5AA87B1876E3A7A99FDFCD7ACF064C181D19F89307E8FCE2A513587DA888E536F9B1BCDFEBF9105CD7BDEB4152FC79D1ABC78915302184E770CBA7AAEC9409BB59DD7A189C7251F8B96131EBA216DB68A49D5E2E3C64C69C4DC5B0879A27C9E1ED45EC04DA8C9CCA0693671B02098C9D7C1D35C51F871F8EEBA20227B3308F825ED9BB1968E31734B482A46C8D717A3148D1E6E66D46C42900EE60E3B584F9BFEF95B72DE2A3FA6914B234C854838CE7B7F173D770452027FD50EE6D48991F51410F4AA62611866FAF1B1CED1BF6E0C7024BB979DEC131FCC6706E68DB6E72FFCD9EB6F253EAF7DEE77AC814AB663F1F10F8DE45E7D74220EB61FE992427379E21EF9CB5B2C5FB998E4EA8DB6A691F3EB4F17C1E4E734949E15BFE1D47FF74D7EF4A3E6208FE112EDB2866A17B276C5D53575582DBAED511D1789829517F2C5AD4FBB1E59F62CB7D18DEE46BBB0DE011B556507AC323C1F4E2E93A4CB7EF59F733B1B69AB2E14EDC81E26FCDE222D346B3ADBCACDEDFA0482A4076DDCF20AC6256AE59535B9E4FA3FC509ABC890AE6106114950112E2ECDF20B913104C; "
	searchValue = "*"
	docNum =  docnum



	url1 = 'http://viaworks.dmf.int/RestService/4/api/Search?q='+searchValue+'%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=1500&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags='
	r = requests.get(url1, headers={'Cookie': cookie}) # send auth unconditionally

	r.raise_for_status() # raise an exception if the authentication fails
	content = r.json()


	conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")


	cur = conn.cursor()


	documentId = content["Data"]["Hits"][docNum]["DocumentId"]
	documentName = content["Data"]["Hits"][docNum]["Name"]
	cur.execute("SELECT * FROM data WHERE dok_id = %s", ([documentId]))
	preExist = cur.fetchall();

	file = open("log.txt", 'a')

	if preExist:
		file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] is already scanned. Ignored.\n')
		file.close()
	if not preExist:
		file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] scanned sucesfully. Result stored in \'data\' table.\n')
		file.close()

		url2= 'http://viaworks.dmf.int/RestService/4/api/Document/convertedtext/'+str(documentId)+'/'
		r2 = requests.get(url2, headers={'Cookie': cookie}) # send auth unconditionally


		with open('mineraler.txt', encoding="latin-1") as f:
		    mineraler = f.read().splitlines()

		documentContent = r2.content


		li = r2.text.split("\n")
		ddmm = re.compile("^(0[1-9]|1[0-9]|2[0-9]|3[01])(0[1-9]|1[012])$")
		yyyy = re.compile("^([0-9]{2}|(1[89][0-9]{2}|2[01][0-9]{2}))$")
		ddmmyyyy = re.compile("^.{0,100}\s*((((0[1-9]|[12][0-9]|3[01])|[1-9]))[.\-\/\, ]{1,2}((0[1-9]|1[012])|([jJ](an|anuar|un|uni|ul|uli)|[fF](eb|ebruar)|[mM](ar|ars|ai)|[aA](pr|pril|ug|ugust)|[sS](ep|eptember)|[oO](kt|ktober)|[nN](ov|ovember)|[dD](es|esember)))[.\-\/\, ]{1,2}((1[89][0-9]{2}|2[01][0-9]{2})|([0-9]{2}))).{0,100}$")
		ddmmyyyy_excact = re.compile("^\s*((((0[1-9]|[12][0-9]|3[01])|[1-9]))[.\-\/\, ]{1,2}((0[1-9]|1[012])|([jJ](an|anuar|un|uni|ul|uli)|[fF](eb|ebruar)|[mM](ar|ars|ai)|[aA](pr|pril|ug|ugust)|[sS](ep|eptember)|[oO](kt|ktober)|[nN](ov|ovember)|[dD](es|esember)))[.\-\/\, ]{1,2}((1[89][0-9]{2}|2[01][0-9]{2})|([0-9]{2})))\s*$")
		sted_regex = re.compile("^([A-Z][a-z]{1,15}(- )?)$")
		kommune_regex = re.compile(".{0,200}[kK][o][m][m][u][n][e]")

		known_minerals = []
		potential_dates = []
		potential_years = []
		prev_lines = []
		length_threshold = 8
		date_dict = {'januar': '01', 'februar': '02', 'mars': '03', 'april': '04', 'mai': '05','juni': '06', 'juli': '07','august': '08','september': '09','oktober': '10','november': '11','desember': '12'}

		stedsnavn = []
		kommuner = []
		kommune_uten_sted = []

		for line in li:
			
			line = line.replace('\\n', ' ').replace('\\r', '').replace("\\","")

			if kommune_regex.match(line):
				ny_line = line.split(" ")
				for i in range(0,len(ny_line)):
					if ny_line[i].isalpha():
						cur.execute("SELECT * FROM kommune WHERE enh_snavn = '" + ny_line[i] + "'")
						ingenkommertilaalesedette = cur.fetchall()
						if ingenkommertilaalesedette:
							if ny_line[i] not in kommune_uten_sted:
								kommune_uten_sted.append(ny_line[i]);


			if ddmmyyyy.match(line):
				new_line = line.split(" ")

				for i in range(0, len(new_line)):
					if ddmmyyyy_excact.match(new_line[i]) and new_line[i] not in potential_dates:
						#print("\n"+new_line[i])
						potential_dates.append(new_line[i].replace("\r", ""))

				for i in range(0, len(new_line)-1,1):
					s = new_line[i]+" "+new_line[i+1]
					if ddmmyyyy_excact.match(s) and s not in potential_dates:
						#print("\n"+s)
						potential_dates.append(s.replace("\r", ""))

				for i in range(0, len(new_line)-2,1):
					s = new_line[i]+" "+new_line[i+1]+" "+new_line[i+2]
					if ddmmyyyy_excact.match(s) and s not in potential_dates:
						#print("\n"+s)
						potential_dates.append(s.replace("\r", ""))



			for mineral in mineraler:
				if(mineral.lower() in line.lower() and mineral not in known_minerals):
					known_minerals.append(mineral)

			strings = line.split(" ")
			for st in strings:
					if st != "":
						if sted_regex.match(st):		
								cur.execute("SELECT sted.enh_snavn, kommune.enh_snavn FROM sted, kommune WHERE sted.enh_snavn = '"+st+"' AND sted.enh_komm = kommune.enh_komm")
								data = cur.fetchall()
								if data:
									for d in data:
										if d[1] not in kommuner:
											kommuner.append(d[1])
										if d not in stedsnavn:
											stedsnavn.append(d)


		stedsdata = []
		dok_id = [documentId]
		cur.execute("INSERT INTO data (dok_id,dok_navn) VALUES ('%s','" + documentName + "')",(dok_id))
		for date in potential_dates:
			cur.execute("UPDATE data SET datoer = datoer || '{" + date + "}' WHERE dok_id = %s",(dok_id))
		for mineral in known_minerals:
			cur.execute("UPDATE data SET mineraler = mineraler || '{" + mineral + "}' WHERE dok_id = %s",(dok_id))
		for navn in stedsnavn:
			if navn[0] not in stedsdata:
				cur.execute("UPDATE data SET stedsnavn = stedsnavn || '{" + navn[0] + "}' WHERE dok_id = %s",(dok_id))
				stedsdata.append(navn[0])

		for kommune in kommune_uten_sted:
			cur.execute("UPDATE data SET kommunenr = kommunenr || '{" + kommune + "}' WHERE dok_id = %s",(dok_id))
		
		conn.commit();

		
		elapsed_time = time.time() - start_time
		print ("Time elapsed: "+str(elapsed_time/60) + " min")


		cur.close()


#start_total_time = time.time()
#elapsed_total_time = time.time() - start_total_time
#print("Total time elapsed: "+str(elapsed_total_time/60) + " min")

if __name__ == '__main__':

	start_doc = int(input("Start document: "))
	end_doc = int(input("End document: "))

	proc_li = list(range(start_doc, start_doc+end_doc))

	pool = Pool()
	#pool = ThreadPool(number of cores..)
	pool.map(threading, proc_li)
	pool.close()
	pool.join()