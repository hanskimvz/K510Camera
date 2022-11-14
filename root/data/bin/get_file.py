import os, time
import paramiko

server = "192.168.1.253"
sshpw = "rootpass12345*"


remoteFiles = [
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/NaiS/get_file.py",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/NaiS/appinit",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/ai/object_detect/object_detect",
    "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/encode_app/encode_main",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/params/params",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/websocket/websocket_server",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/encode_app/imx219_0.conf",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/encode_app/imx219_1.conf",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/encode_app/video_sample.conf",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/NaiS/setting.conf",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/NaiS/get_status.py",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/mediactl_lib/v4l2_demo/v4l2-demo",
    
]

# local_dir = "/app/Nais/"
local_dir = "/root/data/bin/"

finfos = list()
for fpath in remoteFiles:
    xr = fpath.split("/")
    fname = xr[-1]
    rpath = "/".join(xr[:-1])
     
    mtime = 0
    fsize = 0
    if os.path.isfile(fname):
        mtime = int(os.path.getmtime(fname))
        fsize = int(os.path.getsize(fname))
    
    finfos.append({"fname": fname,  "mtime": mtime, "fsize":fsize, "rpath": rpath})

# print (finfos)
# print ()


ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy)
ssh.connect(server, port=22, username='root', password=sshpw)

rs = list()
for f in finfos:
    # print (f)
    xr = [f['fname'],]
    stdin, stdout, stderr = ssh.exec_command("ls -aln ls --color=auto --time-style=long-iso %s/%s" %(f['rpath'], f['fname']))
    
    out = stdout.readlines()
    if out:
        xr.extend(out[0].split(' '))
    
    # ctime = 0
    mtime = 0
    # atime = 0
    fsize = 0

    if len(xr) >5:
        strtime  = " ".join(xr[6:8])
        mtime = int(time.mktime(time.strptime(strtime, "%Y-%m-%d %H:%M")))
        timegap = int(f['mtime']) -int(mtime)
        fsize = int(xr[5])
        fsizegap = int(f['fsize']) - int(fsize)

    rs.append({"fname": xr[0], "r_mtime": f['mtime'], "l_mtime": mtime, 'timegap':timegap, 'time-iso': strtime, "r_fsize": f['fsize'], "l_fsize":fsize, "fsizegap":fsizegap, "rpath": f['rpath']})


sftp = ssh.open_sftp()
print ("  ", end=" ")
print ("%-20s" %('fname'), end=" ")
print ("%12s" %('r_mtime'), end=" ")
print ("%12s" %('l_mtime'), end=" ")
print ("%10s" %('timegap'), end=" ")
print ("%12s" %('r_fsize'), end=" ")
print ("%12s" %('l_fsize'), end=" ")
print ("%10s" %('fsizegap'), end=" ")
print ("%s"   %('rpath'), end=" ")    

print ()

for r in rs:
    flag = 'v' if (r['fsizegap'] != 0 or r['timegap'] > 60) else ""
    if not (r['fname'].startswith('imx219_') and os.path.isfile(local_dir + r['fname'])):
        flag = 'v'

    r_file = "%s/%s"   %(r['rpath'], r['fname'])
    print ("%-2s" %(flag), end=" ")
    print ("%-20s" %r['fname'], end=" ")
    print ("%12d" %r['r_mtime'], end=" ")
    print ("%12d" %r['l_mtime'], end=" ")
    print ("%10d" %r['timegap'], end=" ")
    print ("%12d" %r['r_fsize'], end=" ")
    print ("%12d" %r['l_fsize'], end=" ")
    print ("%10d" %r['fsizegap'], end=" ")
    print ("%s"   %(r_file), end=" ")

    if flag == 'v':
        local_file = local_dir + r['fname']
        print ( "=> %s" %(local_file), end="")
        print ("..", end="")
        try:
            x = sftp.get(r_file, local_file)
        except Exception as e:
            print (".......Fail")
            print ("                          " +str(e))
        
        else:
            print ("..done", end="")

    print ()

# for rfile in remoteFiles:
#     fname = rfile.split("/")[-1]
#     if not fname :
#         print ("Filename error")
#         continue
#     local_file = local_dir + fname
#     print (rfile, "=>", local_file)
#     info = sftp.stat(rfile)

#     print ("downloading file %s ==> %s: %s" %(rfile, local_file, info))
#     sftp.get(rfile, local_file)

# print ("done")

sftp.close()
ssh.close()