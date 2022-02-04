#!/bin/bash

PORT=4040
fuser -k 4040/tcp
cd build/web/
python3 -u -m http.server $PORT 2> log.txt
