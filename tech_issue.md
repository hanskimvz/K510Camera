
## webpage(php)에서 sqlite3 db 쓰기가 안될때.
- 읽기는 잘 된다. 쓰기는 안된다. 권한 문제가 있다. php-fpm.conf에서 

``` 
user = www-data
group = www-data
```
로 변경. 그 전에 www-data라는 user를 추가한다. adduser만 되는 듯.
```
chown www-data /mnt/db/param.db
chown -R :www-data /mnt/db/param.db

```

```
chown nobody /mnt/db/param.db
chown -R :nobody /mnt/db/param.db

```

adduser --system --no-create-home --shell /bin/false --group --disabled-login www-data


공유 메모리 배치
param setting   0xF6080 :  131072   // 2^17
prompt          0xF6081 :    1024   // 2^10
enc frame ch0   0xF6082 : 1048576   // 2^20
enc frame ch1   0xF6083 : 1048576   // 2^20
enc frame ch2   0xF6084 : 1048576   // 2^20
VCA             0xF6085 :    4096   // 2^12
