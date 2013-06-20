Title: Copy running Linux systems to other machines over network
Author: FrozenCow
Date: 20 June 2013 16:30:00 +0200

Sometimes you want to upgrade your system to a new machine. The new machine has a new (bigger) disk, different hardware, maybe you even want a different partition layout. For these purposes it isn't sufficient to make a byte-for-byte backup, since the disk has a different size. A file-based copy is needed.

In this tutorial we will do the copy over network where both the source and destination machines are connected to. We do this while the source machine is still running. That way existing processes, like apache/nginx/samba, will not get interrupted. With gigabit network cards this should also be more efficient and less time-consuming than copying disks on the same machine.

## Requirements

* A recent ArchLinux LiveCD (tested on `archlinux-2013.05.01-dual.iso`)
* A running Linux system (source)
* Another machine that has nothing installed (destination)
* rsync installed on the source machine

This tutorial will also presume the destination machine will have a basic partition layout with one disk and one ext4 partition and no swap partitions. For other partition layouts you will need to deviate from this tutorial.

## General process

We will use the ArchLinux LiveCD on the destination machine to have a capable Linux system where we can setup partitions, setup ssh, login to from the source system and copy files from the source system to the destination system. Lastly we will configure the system using the tools like arch-chroot and genfstab. This may seem ArchLinux-focused, but the tools can be used to copy any other distribution as well.

## Boot from LiveCD

First boot the destination machine from the ArchLinux LiveCD. Choose the architecture of your destination machine.

## Setup partitions

Once booted, we'll setup the partitions on the destination system using `cfdisk`:

	# cfdisk /dev/sda

Create one partition, make it bootable, write your changes and exit.

Now we'll format the new partition with ext4:

	# mkfs.ext4 /dev/sda1

Next we'll mount the new partition so that we can later write files to it:

	# mount /dev/sda1 /mnt

## Setup SSH

First we want the target system to be accessible through the Live environment so that we can copy files over from the source system. We need ssh and some way to login as root.

First we set a password for root using:

	# passwd

Next we enable sshd

	# systemctl start sshd

We should now be able to connect through SSH from the source system to the destination machine.

Check the IP address of the destination machine using:

	# ip addr show

We'll presume in the rest of the tutorial the IP address of the destination machine is `192.168.1.101`.

## Copying files

Go to the source machine and make sure you're logged in as root.

Next we will copy all files of root `/` from the source machine over to the new partition on the destination machine `192.168.1.101` mounted at `/mnt`.

Before copying files you might want to set the root partition to be read-only. That way files will not be changed while we're copying files. This step is optional, in my experience it does not matter much, however it's still recommended to do:

	# mount -o remount,ro /

We use `rsync` since it includes a lot of nice features to do such a copy operation easily and fast:

	# rsync -xa / root@192.168.1.101:/mnt/

Accept the key of the destination PC when asked by typing `yes`.
Type in the password you chose when using `passwd` before.
`rsync` will now copy all files, directories, permissions and owners over to the destination machine. It also skips all files and directories that are not on the root filesystem, like `/dev/`, `/sys/`. If there are filesystems that are mounted separately on the source machine and your want those copied too, use rsync again on those mountpoints too.

After a while rsync will finish and the files are be copied.

As a rudimentary check to see whether rsync copied everything you can use `df -h` to see how much space is used on the root partition. Use the same command on the destination machine and the used space should be the same as the source machine. Be sure to not confuse `/` on the source machine and `/mnt` on the destination machine.

Now you can make the root partition writable again, so normal processes can continue again:

	# mount -o remount,rw /

## Setup booting

Go back to the destination machine.

Since the destination machine presumably has a different disk and maybe even a different disk controller we will need fix a few things before we're able to boot on the destination machine. These are:

* GRUB
* `/etc/fstab`

### Installing and configuring GRUB

First we will install GRUB and regenerate GRUBs configuration. We do this using system we just copied over by chrooting. ArchLinux has a convenient tool that handles chroot safely:

	# arch-chroot /mnt

From here we can use the tools just like we would use them on the source system. First we will regenerate GRUBs configuration:

	# grub-mkconfig | tee /boot/grub/grub.cfg

Next we will install GRUB to the boot sector:

	# grub-install /dev/sda

Now leave chroot by pressing Ctrl+D or typing `exit`.

### Generate fstab

The ArchLinux liveCD also comes with a handy tool called `genfstab` that can generate `/etc/fstab` for you. It'll detect what partitions are mounted and will lookup their UUID. This step should be easy:

	# genfstab /mnt | tee /mnt/etc/fstab

Now everything should be setup correctly.

Unmount the `/mnt` partition using:

	# umount /mnt

## Booting

Before rebooting the destination machine a few notes of precaution:

If you used a static IP address for the source machine, this same address will be used for the destination machine. Shut down the source machine just to be sure or change the IP address of the source or destination machine.

Now reboot your destination machine and remove the ArchLinux LiveCD.

### Differing disk controller

If the destination system cannot find the root partition upon booting, you will likely have a (very) different disk controller compared to the source system. Most often you will not find problems with this, so only follow this part of the guide if this is indeed the case.

Support for the specific disk controller of the system is baked into initramfs: the part of the boot process that, among others, finds and mounts the root partition. The initramfs needs additional modules baked in, so we need to regenerate initramfs. This will detect what modules are needed and place those into the new initramfs.

To do this we need to start with the ArchLinux LiveCD again. Mount the root partition and use chroot to get into the system:

	# mount /dev/sda1 /mnt
	# arch-chroot /mnt

Now we can use the utilities of the source system again. Which utility we need to regenerate initramfs depends on the distribution that was copied.

For Debian-like systems you can use:

	# update-initramfs -u

For ArchLinux-like systems you can use:

	# mkinitcpio -p linux

Exit chroot again using Ctrl+D or by typing `exit`. Unmount `/mnt` again:

	# umount /mnt

And reboot the machine. It should now be able to find the root partition again.