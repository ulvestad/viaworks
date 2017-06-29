#!/usr/bin/env python
import psycopg2
import json

try:
    conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")
except:
    print ("I am unable to connect to the database")

cur = conn.cursor()

cur.execute("SELECT * FROM data ORDER BY dok_id")
rows = cur.fetchall()


for row in rows:
	lagreSteder = []
	dok_id = [row[0]]
	if row[3]:
		for stedsnavn in row[3]:
			cur.execute("SELECT enh_snavn FROM kommune where enh_snavn = '" + str(stedsnavn) + "'")
			kommune = cur.fetchall()
			if(kommune):
				cur.execute("SELECT stedsnavn FROM data WHERE '" + kommune[0][0] + "' = ANY(kommunenr)")
				kommuneIListe = cur.fetchall()
				if not kommuneIListe:
					cur.execute("UPDATE data SET kommunenr = kommunenr || '{" + kommune[0][0] + "}' WHERE dok_id = %s",(dok_id))

			else:
				lagreSteder.append(stedsnavn)

	cur.execute("UPDATE data SET stedsnavn = null WHERE dok_id = '%s'",(dok_id))
	for stedar in lagreSteder:
		cur.execute("UPDATE data SET stedsnavn = stedsnavn || '{" + stedar + "}' WHERE dok_id = %s",(dok_id))
conn.commit()

cur.execute("SELECT * FROM data WHERE dok_id = 2830727")
rows = cur.fetchall()
for row in rows:
	dok_id = [row[0]]
	if row[3] and row[4]:
		for kommune in row[4]:
			steder_i_kommune = []
			for sted in row[3]:
				cur.execute("SELECT sted.enh_snavn,kommune.enh_snavn, sted.coordinates_y, sted.coordinates_x FROM sted,kommune WHERE sted.enh_snavn = '" + sted + "' AND kommune.enh_komm = sted.enh_komm AND kommune.enh_snavn = '" + kommune + "'")
				stedIKomm = cur.fetchall()
				if stedIKomm:
					for komm in stedIKomm:
						if komm[0] not in steder_i_kommune:
							steder_i_kommune.append(komm[0])
							print(str(komm[2]) + "," + str(komm[3]))
			datainn = kommune + "("
			i = 0
			for steidar in steder_i_kommune:
				if i == 0:
					datainn += steidar
				else:
					datainn += ", " + steidar
				i+=1

			datainn += ")"
			cur.execute("UPDATE data SET kommune_sted = kommune_sted || '{" + datainn + "}' WHERE dok_id = %s",(dok_id))




conn.commit()


# cur.execute("SELECT sted.enh_snavn,kommune.enh_snavn FROM sted,kommune WHERE sted.enh_snavn = 'Lade' AND kommune.enh_komm = sted.enh_komm AND kommune.enh_snavn = 'Trondheim'")
# stedererer = cur.fetchall()
# print(stedererer)

# cur.execute("UPDATE data SET stedsnavn = null WHERE dok_id = '%s' AND stedsnavn = '{" + steder[x] + "}'",(dok_id))


# cur.execute("SELECT sted.* FROM sted,kommune WHERE sted.enh_snavn = '" + stedsnavn + "' AND kommune.enh_komm = sted.enh_komm AND kommune.enh_snavn = '" + kommune + "'")
# rows = cur.fetchall()

# print ("Database info:\n")
# for row in rows:
# 	print ("navn: " + row[0] + " komm:" + str(row[1]))

#return rows


cur.close()
