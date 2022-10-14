import os, time
import paramiko
import threading
import socket

server = "192.168.1.253"
sshpw = "rootpass12345*"

remote_file_size = 0
local_file_size = 0

remote_file = "/home/k510_buildroot/k510_crb_lp3_v1_2_defconfig/images/sysimage-emmc.img"
local_file = "/root/sd/p3/sysimage-emmc.img"


def getStatus() :
    wtFlag = 30
    st_bar =""
    while True:
        local_file_size = os.path.getsize(local_file) if os.path.isfile(local_file) else 0
        # print (remote_file_size, local_file_size)
        if remote_file_size < local_file_size + 1024:
            break
        st_bar +="="
        percent = local_file_size*100 //remote_file_size
        print ("\r[%s%d%%]" %(st_bar, percent), end="")

        # if wtFlag == 0:
        #     print ("downloading err")
        #     break
        
        time.sleep(1)
        # wtFlag -=1


ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy)
ssh.connect(server, port=22, username='root', password=sshpw)


sftp = ssh.open_sftp()

info = sftp.stat(remote_file)
remote_file_size = int(info.st_size)

print (remote_file_size, local_file_size)
t = threading.Thread(target=getStatus, args=())
t.start()

print ("downloading file %s ==> %s" %(remote_file, local_file))
sftp.get(remote_file, local_file)
print ("done")

sftp.close()


ssh.close()