#!/bin/bash
cd "$(dirname $0)"
nginx -c "$(pwd)/nginx.conf"
