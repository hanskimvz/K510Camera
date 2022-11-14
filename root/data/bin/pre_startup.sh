#!/bin/sh

cd /root/data/bin
./appinit &
for i in 5 4 3 2 1
do
  echo "strating encoding after $i secs"
  sleep 1
done
echo "strating encoding"
./encode_main  &
for i in 8 7 6 5 4 3 2 1
do
  echo "starting object detect after $i secs"
  sleep 1
done
echo "starting object detect"
./object_detect &



