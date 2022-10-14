
import time
while True:
	with open("/sys/class/thermal/thermal_zone0/temp", "r") as f:
		temp = f.read()
	print (int(temp)/1000)
	time.sleep(2)
