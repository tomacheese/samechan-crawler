#!/bin/sh

while :
do
  pnpm start

  # 再起動前に 10 分待機する
  echo "Waiting 10 minutes before restarting..."
  sleep 600
done
