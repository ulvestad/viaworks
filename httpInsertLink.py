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
from requests.auth import HTTPBasicAuth




base_url = "http://econym.org.uk/gmap/example_plotpoints.htm?"


conn = psycopg2.connect("dbname='stedsnavn' user='postgres' host='10.103.166.213' password='hei'")
cur = conn.cursor()

counter = 0
with open('C:/Users/simulves/Desktop/koordinater.txt', encoding="utf-8") as f:
	for line in f:
		counter +=1
		data = line.replace("\n","").split(";")
		dok_id = data[0]
		rest_url = data[1]
		cur.execute("SELECT link FROM new_data WHERE dok_id = %s",([dok_id]))
		link = cur.fetchall()
		if not link[0][0]:
			#insert here
			url = base_url+rest_url
			cur.execute("UPDATE new_data SET link = '" + url + "' WHERE dok_id = %s",([dok_id]))
		else:
			#update here
			cur.execute("UPDATE new_data SET link = link || '" + rest_url + "' WHERE dok_id = %s",([dok_id]))
		conn.commit()
		print(counter)



cur.close()