#!/bin/sh

while :
do
  yarn start

  # wait 10 minutes before restarting
  echo "Waiting 10 minutes before restarting..."
  sleep 600
done
