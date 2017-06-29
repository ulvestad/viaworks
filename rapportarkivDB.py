import psycopg2
import timeit

start = timeit.timeit()

conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")

cur = conn.cursor()

#cur.execute("SELECT sted.enh_snavn, kommune.enh_snavn FROM sted,kommune WHERE enh_ssr_id > 1125432 AND enh_snmynd = 'KOMM' AND skr_snskrstat = 'G' AND kommune.enh_komm = sted.enh_komm ")
#data = cur.fetchall()
#print(data)
#print(len(data))


#kommuner = {}
#cur.execute("CREATE TABLE rapportarkiv(rappID integer NOT NULL PRIMARY KEY,rappArkivNr integer NOT NULL,interntJournalNr varchar(150),interntAkrivNrRappNr varchar(150),rapportlokalisering varchar(150),gradering varchar(100),kommerFraArkiv varchar(150),oversendtFra varchar(150),fortroligPga varchar(150),fortroligFra varchar(150),tittel text,forfatter text,dato integer,aarstall integer,bedrift varchar(200),fylke varchar(150),kartblad_50 varchar(150),kartblad_250 varchar(150),kommunenavn varchar(200),scannet varchar(150),fagomraade varchar(200),dokumenttype varchar(150),forekomster text,raastoffgruppe varchar(200),raastofftype varchar(200),sammendrag text)")

linjeNr = 0

with open('tbl_Rapportarkiv.txt', encoding="latin-1") as f:
	for line in f:
		print("Linje nr: " + str(linjeNr))
		linjeNr+=1

		li = line.split(";")
	# 	if not int(li[1]):
	# 		stringEn = 1
	# 	else:
	# 		stringEn = int(li[1])
		# cur.execute("INSERT INTO kommune (rappID ,rappArkivNr,interntJournalNr ,interntAkrivNrRappNr ,rapportlokalisering ,gradering ,kommerFraArkiv ,oversendtFra,fortroligPga ,fortroligFra ,tittel,forfatter,dato ,aarstall ,bedrift ,fylke ,kartblad_50 ,kartblad_250,kommunenavn ,scannet ,fagomraade ,dokumenttype ,forekomster ,raastoffgruppe ,raastofftype ,sammendrag ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)",(int(li[0]), int(li[1]), str(li[2]), str(li[3]), str(li[4]), str(li[5]), str(li[6]), str(li[7]), str(li[8]), str(li[9]), str(li[10]), str(li[11]), int(li[12]), int(li[13]), str(li[14]), str(li[15]), str(li[16]), str(li[17]), str(li[18]), str(li[19]), str(li[20]), str(li[21]), str(li[22]), str(li[23]), str(li[24]), str(li[25])))
		if len(li) > 1:
			print("li 1 er null")
		else:
			i = 0;
			for r in li:
				print("linje " + str(i) + ": " + str(r))
				i+=1


conn.commit()
conn.close()

end = timeit.timeit()
print ("Time elapsed: "+str(end - start))