#!/usr/bin/env python
import psycopg2
import json

try:
    conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='localhost' password='hei'")
except:
    print ("I am unable to connect to the database")

cur = conn.cursor()

cur.execute("SELECT enh_snavn, enh_komm from kommune LIMIT 10")
rows = cur.fetchall()
# print ("Database info:\n")
# for row in rows:
# 	print ("navn: " + row[0] + " komm:" + str(row[1]))

#return rows
return json.dumps({'enh_snavn': rows[0], 'enh_komm': rows[1]})