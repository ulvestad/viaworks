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

	cookie = ".ASPXAUTH=76C725413D77F1C34897F188F94D2B02176C42AE7C09995DC178D22A724818C95D2A97DF743A0F4B6F8ABA04792D8EE884F8A15C79CC542E9BC989832373D19A89A77CBCBF2117795A6668D044ACFA5EE263E0D4FC7CCA30310BDBE47AA25D9E8084BE932C862D8D83AC10F85DBF264E0CED2D4E455A038A6A6B3210996D01067BFDA849980E6C1AB881CF6743A86E46176852099D4382B98D35D0C601A7A87DD54434A2B8577617940EA822E01A3ED6A77E3B01F56ED88898B043E39F81593AB96CB5226CE5A95656FEE4549439AE700AD53ADFDEB2B8DBAA02A74DA6F441B017B5A43A453E81510AC778565BDA83A32673D33780EFF69405CD35061DE5F2E9FBC7A96DBB47B848CB3BA0AB48F429C83890E9B70C6933824269FCA0CF314A4ED4ACE91B2D30018C9AA8B0B072CC05D2A16B996772D68760DD5AB036B082CE65A347E1201E527911710DFDF7E9AE844EEFA1F009C876C06BF29F02C0F8E34EE0929D8C16DD06D4D31B5DA4D95EAEB31DBE0CDC56D0170F901E253D92A4E30FDCAA9F0F5588E6C65AB6A1DA9D5EF430D13927B61A2BE38802841340BD38B6F1B1FE9F8D4F; "
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

	cur.execute("SELECT \"kommuneNavn\" FROM \"tbl_Rapportarkiv\" WHERE \"RappArkivNr\" = %s",(dok_navn_utenPDF,))
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