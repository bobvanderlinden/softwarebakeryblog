#!/bin/bash
mkdir -p target/remote
sshfs softwarebakery:/var/www/softwarebakery.com/ target/remote
diff -rq target/remote target/release-build
fusermount -u target/remote
echo -n "Continue? " && read cont
[ "$cont" != "y" ] && exit 1
rsync -r target/release-build/ softwarebakery:/var/www/softwarebakery.com/ --progress
