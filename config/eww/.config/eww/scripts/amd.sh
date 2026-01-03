#!/bin/sh
amdgpu_top -J -d | jq -c -r '(.[] | ((.gpu_activity.GFX.value|tostring) + "%"))'
