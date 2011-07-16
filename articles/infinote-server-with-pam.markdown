Title: Setting up an infinote server with PAM
Author: Maato
Date: 12 Jul 2011 22:42:00 +0200

[Gobby](http://gobby.0x539.de/) is a multi-user text editor. It allows editing text files by multiple persons, while all of them can see and edit in real-time. It is a great tool for online collaboration, like making todos or even coding a program collaboratively.

Gobby connects to an [infinote](http://gobby.0x539.de/trac/wiki/Infinote/Infinoted) server. The server keeps track of the different users and documents.

On Ubuntu 10.04 infinoted 0.4.1-1 is already in the repository and it is easy to set up. However, such a setup does not include username and password authentication, an automatic startup using a init-script and a separate user under which the process should run. Authentication using PAM, and thus username and password, is only available since 0.5.0.

This post contains all of the steps required to run infinoted 0.5.0 on Ubuntu 10.04. This includes compiling, creating the user, init-script and configuration necessary to run infinoted in a proper way.

### Compiling infinoted with PAM support
Since PAM is an optional dependency for infinoted you should make sure that `libpam-dev` is installed before compiling. The configure script does not provide you with any notification of its absence (this will be fixed in a [later version](http://git.0x539.de/?p=infinote.git;a=commit;h=42e314a4af31126342aac8d5e9e3fd633630f0d4)). After that, compilation is rather straightforward:

    $ apt-get install build-essential pkg-config libxml2-dev gnutls-dev libgsasl7-dev libglib2.0-dev
    $ wget http://releases.0x539.de/libinfinity/libinfinity-0.5.0.tar.gz
    $ tar xfvz libinfinity-0.5.0.tar.gz
    $ cd libinfinity-0.5.0
    $ ./configure --prefix=/usr
    $ make
    $ make install

If you are on Ubuntu and want to make a deb package, you can replace the last command (`make install`) by `checkinstall` and answer the questions that follow. Make sure you install checkinstall first:

    $ apt-get install checkinstall

When you've created the package, you can install it using:

    $ dpkg -i infinoted-0.5.0-1.deb


### Configuring infinoted
We'll run the server as a seperate (less privileged) user instead of as root, so we start by creating a new user. The user's home directory will be **/var/infinote**.

    $ useradd --home-dir /var/infinote --user-group --shell /bin/false infinote

Before we can start the server we have to create a home directory, a place to store the documents and its configuration. The server looks for the configuration file `$HOME/.config/infinoted.conf`. We create the directories and set the appropriate permissions on them using the following commands:

    $ mkdir /var/infinote/{,root,sync,.config}
    $ touch /var/infinote/.config/infinoted.conf
    $ chown -R infinote: /var/infinote
    $ chmod -R 0700 /var/infinote
    $ chmod 0600 /var/infinote/.config/infinoted.conf

Now we can fill *infinoted.conf* with the following configuration:

<h5 class='code-link'>/var/infinote/.config/infinoted.conf</h5>
    [infinoted]
    security-policy=require-tls
    root-directory=/var/infinote/root/
    certificate-file=/var/infinote/cert.pem
    key-file=/var/infinote/key.pem
    sync-directory=/var/infinote/sync/
    sync-interval=60
    pam-service=infinote

#### Generating a certificate
You might have noticed a reference to the **cert.pem** and **key.pem** files. These allow the connection to be encrypted. We haven't created them yet, so we'll do that now. The creation of the certificate requires quite a lot of [entropy](http://en.wikipedia.org/wiki/Entropy_\(computing\)). If your machine runs out of entropy this can make the entire process take a very long time. To solve this you could try to generate more entropy by moving your mouse or typing on the keyboard. On a server which has no such peripherals this will obviously not work, so you might have to create the certificate somewhere else and copy it over to the server. Another thing to look out for is the fact that the certificate (cert.pem) will be bound to a domain name. This is determined by the hostname of the computer generating the certificate, so you might have to change it temporarily.


    $ hostname your_temporary_hostname # optional, don't forget to restore afterwards
    $ cd /var/infinote
    $ sudo -u infinote infinoted-0.5 -k key.pem -c cert.pem --create-key --create-certificate
    $ chown 0600 key.pem cert.pem


### Authentication using PAM
The [documentation of infinoted](http://gobby.0x539.de/trac/wiki/Infinote/Infinoted) shows the option to setup PAM but gives no hints on how to do it. There are multiple ways to setup PAM authentication with infinoted. We chose to use the [pam\_pwdfile](http://cpbotha.net/software/pam_pwdfile/) authentication module. This allows you to define users and passwords in a flat text file, so that you do not need to create full system users for them. Since all users that are in this file are solely created for use with infinote we will use the module [pam_permit](http://www.kernel.org/pub/linux/libs/pam/Linux-PAM-html/sag-pam_permit.html) to forgo account management.

We start by creating a new PAM service in the `/etc/pam.d/` directory called `infinote` and use the following as its contents:
<h5 class='code-link'>/etc/pam.d/infinote</h5>

    #%PAM-1.0
    auth      required    /lib/security/pam_pwdfile.so pwdfile /etc/infinoted.passwd
    account   required    pam_permit.so

Now we have to create the file that defines users and their passwords, we have chose to place it at `/etc/infinoted.passwd`. The file should contain username:password_hash pairs. The password hashes can be generated using any of the following commands:

    $ openssl passwd -1 <password>
    $ openssl passwd -crypt <password>
    $ htpasswd -nbd <username> <password>

Note that both of the available hashing methods are rather weak, so don't count on these hashes to provide you with any security. After having created the hashes for your passwords, your password file should look something like this:

<h5 class='code-link'>/etc/infinoted.passwd</h5>

    maato:$1$yII45doY$ZSH/biluHy12zp9KOuEQ9/
    frozencow:SiN2d/00c/ubI


### Creating an init script
To automatically (and easily) start and stop the infinote daemon, we will need an init-script. We placed the code below in `/etc/init.d/infinoted`. Make sure to also run `chmod +x /etc/init.d/infinoted`.

<h5 class='code-link'>/etc/init.d/infinoted</h5>

    #! /bin/sh
    ### BEGIN INIT INFO
    # Provides:          infinoted
    # Required-Start:    $local_fs $remote_fs $network $syslog
    # Required-Stop:     $local_fs $remote_fs $network $syslog
    # Default-Start:     2 3 4 5
    # Default-Stop:      0 1 6
    # Short-Description: starts infinoted
    # Description:       starts infinoted using start-stop-daemon
    ### END INIT INFO
    
    PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin
    DAEMON=/usr/bin/infinoted-0.5
    USER=infinote
    NAME=infinoted
    DESC=infinoted
    
    test -x $DAEMON || exit 0
    
    if [ -f /etc/default/infinoted ] ; then
            . /etc/default/infinoted
    fi
    
    set -e
    
    . /lib/lsb/init-functions
    
    case "$1" in
      start)
            echo -n "Starting $DESC: "
            start-stop-daemon --start -b -m --quiet -c $USER --pidfile /var/run/$NAME.pid \
                    --exec $DAEMON -- $DAEMON_OPTS || true
            echo "$NAME."
            ;;
      stop)
            echo -n "Stopping $DESC: "
            start-stop-daemon --stop --quiet -c $USER --pidfile /var/run/$NAME.pid \
                    --exec $DAEMON || true
            echo "$NAME."
            ;;
      restart)
            echo -n "Restarting $DESC: "
            start-stop-daemon --start -b -m --quiet -c $USER --pidfile /var/run/$NAME.pid \
                    --exec $DAEMON -- $DAEMON_OPTS || true
            sleep 1
            start-stop-daemon --stop --quiet -c $USER --pidfile /var/run/$NAME.pid \
                    --exec $DAEMON || true
            echo "$NAME."
            ;;
      status)
            status_of_proc -p /var/run/$NAME.pid "$DAEMON" infinoted && exit 0 || exit $?
            ;;
      *)
            echo "Usage: $NAME {start|stop|restart}" >&2
            exit 1
            ;;
    esac
    
    exit 0


###Additional information###
 - pam-pwdfile [README](http://code.google.com/p/pam-pwdfile/source/browse/trunk/README)

