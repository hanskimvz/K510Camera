while :
do
    if [ -d "/root/data/bin" ]; then
        sleep 1
        break
    fi
    echo "waiting"
    sleep 1
done
pwd
cd /root/data/bin/
pwd
./pre_startup.sh
./post_startup.sh
