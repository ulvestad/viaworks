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
import time


def threading(docnum):

	start_time = time.time()

	cookie = ".ASPXAUTH=7570AF3285570B1066D91825783243A1B8523212C15760FA8AB5015AFAFA26FBDCE4F8B87B54AEF24783938A8334B4AAB3A256A02276827EE4A9BD6E81171B7CB904EFC9C5D73A2A09A8C1BC30E94EEB9B9441F026182F76FB0A7988FE39DDC4CA72CB79A42016F0FF8A13251975522D370C70BAB2309EE3C025CB42C6AB15EDC46426314090BA435F446C60F1350C04C983B5FEB58AC851801BB0DB9D08A532E24A02B636BA8E9D9635149FC63D24C90B1B8BDFCE04F3FB204B13BA29898A612473840839EF4D265017AD81C6C17F1062618D5D30583F2BFB301CD7EC95E7FAFEAB05701C09F58F68FC1F43D2AF594F39B4D828EA9276F29969CE351922B8C85B693511C70ED91FB003C9B9E32E150AB6C259AB77B85CE8181C57F15A9DC8190E8A1F27588257F0B87F87BBD5E3D22213E7800E981624B9C6462193EE409FCAD0CC130C43B7783C544065AA2175C7F8C8A8258BC2961A4F47D2E92543EC049C8B88DA8B0CD30E666E99CB1CB31E76F91289B8CEA99B6ABA4C7C948E4578E2DD90DC3A59B89CE6EB3E414496FC01639DFFE3AD8CB2B5165D824C0BB2CED23CFB3176BE69; "
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


	url2= 'http://viaworks.dmf.int/RestService/4/api/Document/convertedtext/'+str(documentId)+'/'
	r2 = requests.get(url2, headers={'Cookie': cookie}) # send auth unconditionally


	with open('mineraler.txt', encoding="latin-1") as f:
	    mineraler = f.read().splitlines()

	documentContent = r2.content

	file = open("log.txt", 'a')

	if r2.text == "" or r2.text == None:
		file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] has no OCR content. (VIAWORKS has not indexed the file yet).\n')
		file.close()
		return None
		
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

	cur.execute("SELECT \"KommuneNavn\" FROM \"tbl_Rapportarkiv\" WHERE \"RappArkivNr\" = %s",(dok_navn_utenPDF,))
	komm_i_rapport = cur.fetchall()
	kom_li =[]
	kom_sted = {}
	
	#dictonary for kommune(stedsnavn
	if komm_i_rapport != []:
		if komm_i_rapport[0][0] != None:
			komm_i_rapport = komm_i_rapport[0][0].split("\n")

	for k in komm_i_rapport:
		kom_li.append(k)
		kom_sted[k] = None

	#check if already scanned
	cur.execute("SELECT stedsnavn FROM data WHERE dok_id = %s",(documentId,))
	isScanned = cur.fetchall()


	


	#if scanned only check stedsnavn againt kommune (avoids going thorugh line by line)
	if isScanned:

		cur.execute("SELECT mineraler FROM data WHERE dok_id = %s",(documentId,))
		known_minerals = cur.fetchall()
		
		for ko in kom_li:
			for st in isScanned[0][0]:
				cur.execute("SELECT sted.enh_snavn FROM sted, kommune WHERE sted.enh_snavn = '"+st+"' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn =  %s",(ko,))
				data = cur.fetchall()
				if data:
					for d in data:
						if d[0] not in stedsnavn and d[0] != ko:
							stedsnavn.append(d[0])
							kom_sted[ko]=d[0]
	
	#goes through line by line in document since it has not been scanned
	else:
		for line in li:
			line = line.replace('\\n', ' ').replace('\\r', '').replace("\\","")

			for mineral in mineraler:
				if(mineral.lower() in line.lower() and mineral not in known_minerals):
					known_minerals.append(mineral)

			strings = line.split(" ")
			for st in strings:
					if st != "":
						if sted_regex.match(st):
								for ko in kom_li:
									cur.execute("SELECT sted.enh_snavn FROM sted, kommune WHERE sted.enh_snavn = '"+st+"' AND sted.enh_komm = kommune.enh_komm AND kommune.enh_snavn =  %s",(ko,))
									data = cur.fetchall()
									if data:
										for d in data:
											isKey = kom_sted.get(d[0])
											if not isKey and d[0] != ko and d[0] not in stedsnavn:
												if kom_sted.get(ko) == None:
													kom_sted[ko] = d[0]
													stedsnavn.append(d[0])
												else:
													kom_sted[ko] += ", "+d[0]
													stedsnavn.append(d[0])


	cur.execute("SELECT dok_id FROM new_data WHERE dok_id = %s",([documentId]))
	exists = cur.fetchall()
	if not exists:

		cur.execute("INSERT INTO new_data (dok_id,dok_navn) VALUES ('%s','" + str(documentName) + "')",([documentId]))
		

		if known_minerals[0][0] != None:
			for mineral in known_minerals[0][0]:
				cur.execute("UPDATE new_data SET mineraler = mineraler || '{" + mineral + "}' WHERE dok_id = %s",([documentId]))

		for key in kom_sted:
			if key != None:
				if kom_sted.get(key) != None:
					insert_String = str(key)+"("+kom_sted.get(key)+")"
					cur.execute("UPDATE new_data SET sted_i_kommmune = sted_i_kommmune || '{" + insert_String + "}' WHERE dok_id = %s",([documentId]))
				else:
					if key[0] != None:
						insert_String = str(key)+"( )"
						cur.execute("UPDATE new_data SET sted_i_kommmune = sted_i_kommmune || '{" + insert_String + "}' WHERE dok_id = %s",([documentId]))

	
	conn.commit();

	
	elapsed_time = time.time() - start_time
	print ("Time elapsed: "+str(elapsed_time/60) + " min")

	if isScanned:
		file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] is already scanned. Ignored. '+ str(elapsed_time/60)+'\n')
		file.close()
	else:
		file.write( str(docNum) +' ['+str(documentId) +', '+str(documentName)+'] scanned succesfully. '+ str(elapsed_time/60)+'\n')
		file.close()
	cur.close()




if __name__ == '__main__':

	start_doc = int(input("Start document: "))
	end_doc = int(input("End document: "))

	proc_li = list(range(start_doc, 1+end_doc))

	pool = Pool()
	#pool = ThreadPool(number of cores..)
	pool.map(threading, proc_li)
	pool.close()
	pool.join()