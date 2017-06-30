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

def threading(docnum):

	start_time = time.time()


	session = requests.Session()
	headers = {'Content-type': 'application/json'}
	payload = {"IsPersistent":'true',"Credentials":[{"Name":"windowsusername","Value":"kimknuds"},{"Name":"windowspassword","Value":"Jalla9012"},{"Name":"windowsdomain","Value":"dmf"}]}

	r = session.post('http://viaworks.dmf.int/RestService/4/api/Login/Forms/Session', data=json.dumps(payload), headers=headers)

	#print(r.cookies['.ASPXAUTH'])
	#print(r.cookies.keys())



	cookie = ".ASPXAUTH="+r.cookies['.ASPXAUTH']+";"
	searchValue = "*"
	docNum =  docnum



	url1 = 'http://viaworks.dmf.int/RestService/4/api/Search?q='+searchValue+'%20vw(vwr(Source%3DKjellerarkiv%201%5C%5Cbv-rapporter%20samlet%205.5.2017))&r=1500&s=0&format=json&sort=score%20desc&lang=en-US&spid=0&df=&dt=&tags='
	r = requests.get(url1, headers={'Cookie': cookie}) # send auth unconditionally

	r.raise_for_status() # raise an exception if the authentication fails
	content = r.json()

	#print(r.text)
	


if __name__ == '__main__':

	start_doc = int(input("Start document: "))
	end_doc = int(input("End document: "))

	proc_li = list(range(start_doc, start_doc+end_doc))

	pool = Pool()
	#pool = ThreadPool(number of cores..)
	pool.map(threading, proc_li)
	pool.close()
	pool.join()