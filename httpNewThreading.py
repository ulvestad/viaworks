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

	cookie = ".ASPXAUTH=25CA7196C2F26D7DF53FE754AFA7765B5277F0862294D34136A7D3C80350ED5C31598EB0A52EFA562186EA32BE4056C4D81C5409F03F84F6EF06236B87FCB8ACD14902F7AF1D720F93051B8E51CE8F70345CCDA5991E7C18D3EBFB11319D2F2B081049104EBB7090F48722D9FB8C8268D5F36391C07BA4559E30DB71D62320DFC4A3A1A4235D20439BAF529020F86C823CC1B947B689BB9BD05D47B14C53A565D492D52A935E03361017004A2F28262DB1C3D336C10A9CEB236B58DEE0F2A9C96B8783DC03FE33E7464B53ADB00D1731DEA569B1A471A12E657B281478156F4545B85B3D66E5027DA9E12C8BDCC3BEDFA3DD1B310803615C6A38496CBE8F5413CBEF9D5C697BC86CD3D85C36ECF9E9902D7F9F4B89516D37B270ECC6CFD889DFBA515615652531DF66D27F011159B5049677D2CC5AAAA189EA05E3D162C4C4639FCE41F61EF243B9EBC577BA7216EB45096C6393C9CD18F8ED9646C3EC658B023C761AA4AA5D827D08CCC7B2707428858BCE714C454283A560EA9741F553FECA6E152362C746B9D730AB8EA220B70B5DFFA6706248C0787C62E4886C7BE3BDF215619D38; "
	searchValue = "*"
	docNum =  docnum



	url1 = 'http://viaworks.dmf.int/RestService/4/api/Search?q='+searchValue+'%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=6900&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags='
	r = requests.get(url1, headers={'Cookie': cookie}) # send auth unconditionally

	r.raise_for_status() # raise an exception if the authentication fails
	content = r.json()


	conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")


	cur = conn.cursor()


	documentId = content["Data"]["Hits"][docNum]["DocumentId"]
	documentName = content["Data"]["Hits"][docNum]["Name"]
	# cur.execute("SELECT * FROM data WHERE dok_id = %s", ([documentId]))
	# preExist = cur.fetchall();

	# file = open("log.txt", 'a')

	# if preExist:
	# 	file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] is already scanned. Ignored.\n')
	# 	file.close()
	# if not preExist:
	# 	file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] scanned sucesfully. Result stored in \'data\' table.\n')
	# 	file.close()

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

	dok_navn_utenPDF = documentName.split(".")[0].replace("BV","")
	print(dok_navn_utenPDF)

	cur.execute("SELECT \"KommuneNavn\" FROM \"tbl_Rapportarkiv\" WHERE \"RappArkivNr\" = %s",(dok_navn_utenPDF,))
	komm_i_rapport = cur.fetchall()
	print(komm_i_rapport)
	print(komm_i_rapport[0])
	print(komm_i_rapport[0][0])

	for line in li:
		
		line = line.replace('\\n', ' ').replace('\\r', '').replace("\\","")


		#KJØR SELECT FOR Å HENTE REGISTRERT KOMMUNE FRA RAPPORT_ARKIV TABLE
		#hvis det finnes gjør dette:

		for mineral in mineraler:
			if(mineral.lower() in line.lower() and mineral not in known_minerals):
				known_minerals.append(mineral)

		strings = line.split(" ")
		for st in strings:
				if st != "":
					if sted_regex.match(st):		
							cur.execute("SELECT sted.enh_snavn FROM sted, kommune WHERE sted.enh_snavn = '"+st+"' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn =  %s",(komm_i_rapport[0]))
							data = cur.fetchall()
							if data:
								for d in data:
									# if d[1] not in kommuner:
									# 	kommuner.append(d[1])
									if d not in stedsnavn:
										stedsnavn.append(d)
	print(documentId)
	print(stedsnavn)


		#hvis ikke gjør det på gamle måten:

	# 	if kommune_regex.match(line):
	# 		ny_line = line.split(" ")
	# 		for i in range(0,len(ny_line)):
	# 			if ny_line[i].isalpha():
	# 				cur.execute("SELECT * FROM kommune WHERE enh_snavn = '" + ny_line[i] + "'")
	# 				ingenkommertilaalesedette = cur.fetchall()
	# 				if ingenkommertilaalesedette:
	# 					if ny_line[i] not in kommune_uten_sted:
	# 						kommune_uten_sted.append(ny_line[i]);


	# 	if ddmmyyyy.match(line):
	# 		new_line = line.split(" ")

	# 		for i in range(0, len(new_line)):
	# 			if ddmmyyyy_excact.match(new_line[i]) and new_line[i] not in potential_dates:
	# 				#print("\n"+new_line[i])
	# 				potential_dates.append(new_line[i].replace("\r", ""))

	# 		for i in range(0, len(new_line)-1,1):
	# 			s = new_line[i]+" "+new_line[i+1]
	# 			if ddmmyyyy_excact.match(s) and s not in potential_dates:
	# 				#print("\n"+s)
	# 				potential_dates.append(s.replace("\r", ""))

	# 		for i in range(0, len(new_line)-2,1):
	# 			s = new_line[i]+" "+new_line[i+1]+" "+new_line[i+2]
	# 			if ddmmyyyy_excact.match(s) and s not in potential_dates:
	# 				#print("\n"+s)
	# 				potential_dates.append(s.replace("\r", ""))



	# 	for mineral in mineraler:
	# 		if(mineral.lower() in line.lower() and mineral not in known_minerals):
	# 			known_minerals.append(mineral)

	# 	strings = line.split(" ")
	# 	for st in strings:
	# 			if st != "":
	# 				if sted_regex.match(st):		
	# 						cur.execute("SELECT sted.enh_snavn, kommune.enh_snavn FROM sted, kommune WHERE sted.enh_snavn = '"+st+"' AND sted.enh_komm = kommune.enh_komm")
	# 						data = cur.fetchall()
	# 						if data:
	# 							for d in data:
	# 								if d[1] not in kommuner:
	# 									kommuner.append(d[1])
	# 								if d not in stedsnavn:
	# 									stedsnavn.append(d)


	# stedsdata = []
	# dok_id = [documentId]
	# cur.execute("INSERT INTO data (dok_id,dok_navn) VALUES ('%s','" + documentName + "')",(dok_id))
	# for date in potential_dates:
	# 	cur.execute("UPDATE data SET datoer = datoer || '{" + date + "}' WHERE dok_id = %s",(dok_id))
	# for mineral in known_minerals:
	# 	cur.execute("UPDATE data SET mineraler = mineraler || '{" + mineral + "}' WHERE dok_id = %s",(dok_id))
	# for navn in stedsnavn:
	# 	if navn[0] not in stedsdata:
	# 		cur.execute("UPDATE data SET stedsnavn = stedsnavn || '{" + navn[0] + "}' WHERE dok_id = %s",(dok_id))
	# 		stedsdata.append(navn[0])

	# for kommune in kommune_uten_sted:
	# 	cur.execute("UPDATE data SET kommunenr = kommunenr || '{" + kommune + "}' WHERE dok_id = %s",(dok_id))
	
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