Title: Persistent Kali Linux in DriveDroid
Author: FrozenCow
Date: 06 March 2015 13:31:00 +0200

Using Linux Live ISO images is convenient. Easy to install and always have the same environment each time you use it. However, it doesn't save your changes between uses. Sometimes you want to install additional applications and use it each time your boot. This is called a persistent live USB.

[Kali Linux](https://www.kali.org/) is a Linux distribution used primarily for penetration testing. It comes with various tools that are useful to test your networks and applications for vulnerabilities. It also has good support for persistence.

In this tutorial we will show how set up persistence for Kali Linux that is running from an Android phone using DriveDroid.

# Requirements

* A Linux installation with gparted
* A paid version of DriveDroid (for resizing images)
* An USB cable

# Downloading Kali Linux

First go to DriveDroid on your Android phone. Press the + button in the bottom of the screen and choose 'Download image...'. In the list of distributions choose 'Kali Linux' and choose a non-mini Kali Linux image that fits your needs. The mini images are not suitable for live environments and are just to run the installer. For this example we used `kali-linux-1.1.0-amd64.iso`. Wait for the download to complete.

# Resizing the image

The image that we just downloaded barely fits the basic installation of Kali Linux. To install extra software we need some additional space. This is why we need to resize the image.

Go back to DriveDroid and long-press `kali-linux-1.1.0-amd64.iso`. Choose 'Resize image...' and enter a bigger size for the image. For this example we used 3GB. Wait until the image has been resized.

# Creating the persistence partition

The image now has some free space where we can create a partition that will be used for persistence.

In DriveDroid press `kali-linux-1.1.0-amd64.iso` and choose to host the image as an writable USB drive. Connect your phone to your PC and start gparted (`sudo gparted`).

In gparted find the disk that your phone is hosting. In this example it should show up as a 3GB disk. Do note the name of the disk, since we need it later. In this example it is named `/dev/sdX`. After selecting `/dev/sdX`, you should see that the disk has a bunch of unallocated space; the space we created by resizing the image.

Next add a new partition. Use 'ext4' as the file system and 'persistence' as the label. Press 'Ok' and see if the partition indeed fills the unallocated space. After that press 'Apply' and close gparted.

# Configuring Kali Linux

Now that we have a partition where Kali Linux can store extra applications and files, we need to configure Kali Linux to actually use that partition.

First make sure you're root:

    sudo su

We will make a temporary directory where we can mount the configuration partition of Kali Linux:

    mkdir -p /tmp/kalilinux

Next, we mount the partition:

    mount /dev/sdX3 /tmp/kalilinux

We add the persistence configuration file that Kali Linux will use when booting:

    echo "/ union" > /tmp/kalilinux/persistence.conf

Lastly we unmount the partition:

    umount /tmp/kalilinux

The image should now be good to go. Reboot your PC and boot from your phone to check the results.

# Increase the persistent space

If you ever find out that you run out of space in Kali Linux, you can still increase the size of the persistence partition.

Go to DriveDroid and long-press `kali-linux-1.1.0-amd64.iso`. Choose 'Resize image...' and enter a bigger size for the image.

Now host the image by pressing `kali-linux-1.1.0-amd64.iso` and choosing a writable USB drive. Open up gparted and choose the disk like before.

Instead of adding a partition like we did before, we will change the size of the already existing persistence partition. Right click on the persistence partition and choose 'Resize/Move'. Increase the new size so that there is no free space left. Press 'Resize/Move', hit 'Apply' and close gparted.

Your image should again be ready to go with more space for your applications.