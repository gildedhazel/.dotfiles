#!/bin/sh
INTERVAL="1" # update interval in seconds
IF=$1

if [ -z "$IF" ]; then
    echo "Usage: $0 [network-interface]"
    exit 1
fi

while true; do
    R1=$(cat /sys/class/net/$IF/statistics/rx_bytes)
    T1=$(cat /sys/class/net/$IF/statistics/tx_bytes)
    sleep $INTERVAL
    R2=$(cat /sys/class/net/$IF/statistics/rx_bytes)
    T2=$(cat /sys/class/net/$IF/statistics/tx_bytes)
    TBPS=$((T2 - T1))
    RBPS=$((R2 - R1))
    TKBPS=$((TBPS / 1024 / INTERVAL))
    RKBPS=$((RBPS / 1024 / INTERVAL))
    echo "↓$RKBPS kB/s ↑$TKBPS kB/s"
done

