#!/bin/sh

d=`date "+%d"`
t=60

a=0
b=10

while [ $a -lt $b ]
do
  i=`expr \( $a + $d \* 2 \) % $t + 1`
  node .dist/gongkou.js list_4_$i.html
  a=`expr $a + 1`
done
