#!/bin/bash
cd "$(dirname $0)"
echo Serving on http://localhost:8000/
nginx -c "$(pwd)/nginx.conf"
