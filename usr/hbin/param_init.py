

import os, sys, time
import json
import sqlite3
import uuid

_CWD = os.path.dirname(os.path.abspath(sys.argv[0]))
param_db = "%s/param.db" %_CWD
# print (_CWD); sys.exit()




def patchParam():
    fname_ini = "%s/param.table.ini" %_CWD
    
    if not os.path.isfile(fname_ini):
        print ("Error, File %s is not exist" %fname_ini)
        return False

    arr_list = list()
    arr_sq = list()
    arr_grps = list()

    sq = """CREATE TABLE IF NOT EXISTS param_tbl (\
        prino INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
        groupPath TEXT,\
        entryName TEXT,\
        entryValue TEXT,\
        description TEXT,\
        datatype TEXT default 'sz',\
        option TEXT,\
        create_permission INTEGER default 7,\
        delete_permission INTEGER default 7,\
        update_permission INTEGER default 7,\
        read_permission INTEGER default 7,\
        readonly INTEGER default 0,\
        writeonly INTEGER default 0,\
        group1 TEXT,\
        group2 TEXT,\
        group3 TEXT,\
        group4 TEXT,\
        group5 TEXT,\
        group6 TEXT,\
        made TEXT,\
        regdate NUMERIC\
    )"""
    arr_sq.append(sq)
    arr_sq.append("commit")

    sq = """CREATE TABLE IF NOT EXISTS info_tbl(\
        prino INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,\
        category TEXT,\
        entryName TEXT,\
        entryValue TEXT,\
        description TEXT,\
        regdate NUMERIC\
    )"""

    arr_sq.append(sq)
    arr_sq.append("commit")


    with open (fname_ini, "r", encoding='utf-8') as f:
        body = f.read()

    for line in body.splitlines():
        line = line.strip()
        if not line or line[0] == "#" or line[0] == ";" or  line[0:1] == "//":
            continue

        line = line.replace("'", "&#039;")
        arr = json.loads('['+line+']')
        arr_list.append(tuple(arr))
        arr_grps.append(arr[0])

    dbsqcon = sqlite3.connect(param_db)
    cur = dbsqcon.cursor()
    for i, sq in enumerate(arr_sq):
        print(sq)
        if sq == 'commit':
            dbsqcon.commit()
            continue
        cur.execute(sq)
        
    arr_sq = list()        
    for r in arr_list:
        # sq = "select * from sqlite_master where name='param_tbl'"
        exp = r[0].split(".")
        grps = ["", "", "", "", "", ""]
        groupPath=""
        for i, e in enumerate(exp):
            grps[i] = e
            if i < len(exp)-1:
                if groupPath:
                    groupPath +="."
                groupPath += e

        entryName = exp.pop()
        sq = "select prino from param_tbl where groupPath='%s' and entryName='%s'" %(groupPath, entryName)
        # print (sq)
        cur.execute(sq)
        row = cur.fetchone()
        if (row == None):
            sq  = "INSERT INTO param_tbl( groupPath, entryName, entryValue, datatype, option, description, group1, group2, group3, group4, group5, group6, readonly, writeonly, made,  regdate, create_permission, delete_permission, update_permission, read_permission) "
            sq += "VALUES('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', %s, %s, '%s', %s, 0,0,7,7 )" %(groupPath, entryName, r[1], r[2], r[3], r[6], grps[0], grps[1], grps[2], grps[3], grps[4], grps[5], r[4], r[5], 'hanskim', int(time.time()))
        else:
            sq = "UPDATE param_tbl set datatype='%s', option='%s', description='%s', readonly='%s', writeonly='%s' where prino=%s" %(r[2], r[3], r[6], r[4], r[5], row[0])
        arr_sq.append(sq)

    arr_sq.append('commit')

#   MAC
    mac = "%012X" %(uuid.getnode())
    arr_sq.append("update param_tbl set entryValue='%s' where groupPath='system.network.eth0' and entryName='hwaddr'" %mac)    

    # delete unnecessary
    sq = "select * from param_tbl"
    cur.execute(sq)
    rows = cur.fetchall()
    for row in rows:
        if not (row[1] + '.' + row[2]  in arr_grps) :
            arr_sq.append('delete from param_tbl where prino=%d' %row[0])
    
    arr_sq.append('commit')

    for i, sq in enumerate(arr_sq):
        print(sq)
        if sq == 'commit':
            dbsqcon.commit()
            continue
        cur.execute(sq)

    dbsqcon.close()

if __name__ == "__main__":
    patchParam()