# about
Try [kGenProg](https://github.com/kusumotolab/kGenProg) on your browser.

http://tyr.ics.es.osaka-u.ac.jp/


# how to setup demo server

```shell
# build & start docker container
$ ./build.sh

# stop docker container
$ sudo docker stop kdemo

# show logs
$ sudo docker logs kdemo

# get actual log file path
$ sudo docker inspect kdemo | grep Log
```
