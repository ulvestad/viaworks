#!/usr/bin/env python
import psycopg2

conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")
cur = conn.cursor()

cur.execute("SELECT * FROM data");
rows = cur.fetchall();

for row in rows:
	stedsnavn_kommune = []
	dokumentID = row[0]
	for sted in row[3]:
		cur.execute("SELECT enh_komm from stedsnavn WHERE enh_snavn = '%s'",(sted))
		kommuneNr = cur.fetchall();
		for komm in kommuneNr: # kommuneNr[0] ??
			cur.execute("SELECT enh_snavn FROM kommune WHERE enh_komm = '%s'",(komm))
			kommune = cur.fetchall();
			data = stedsnavnet + "(" + kommune + ")" # kommune[0] ??
			if data not in stedsnavn_kommune:
				stedsnavn_kommune.append(data)
	for info in stedsnavn_kommune:
		cur.execute("INSERT INTO data (sted_i_kommune) VALUES (%s)",(info))