import os, time
import paramiko

server = "192.168.1.253"
sshpw = "rootpass12345*"


remoteFiles = [
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/encode_app/encode_app",
    # "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/NaiS/nais_video",
    "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/build/ai/object_detect/object_detect"
]

local_dir = "/app/Nais/"


ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy)
ssh.connect(server, port=22, username='root', password=sshpw)

sftp = ssh.open_sftp()

for rfile in remoteFiles:
    fname = rfile.split("/")[-1]
    if not fname :
        print ("Filename error")
        continue
    local_file = local_dir + fname
    print (rfile, "=>", local_file)
    info = sftp.stat(rfile)

    print ("downloading file %s ==> %s: %s" %(rfile, local_file, info))
    sftp.get(rfile, local_file)

print ("done")

sftp.close()
ssh.close()