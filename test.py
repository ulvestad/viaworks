#!/usr/bin/env python
import psycopg2

conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")

cur = conn.cursor()

cur.execute("SELECT stedsnavn FROM data WHERE dok_id = 2830730")
data =cur.fetchall()

if data:
	print("Data:")
	print(data)
else:
	print("Ikke data")