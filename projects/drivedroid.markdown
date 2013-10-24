Title: DriveDroid

DriveDroid is an Android application that allows you to boot your PC from ISO/IMG files stored on your phone. This is ideal for trying Linux distributions or always having a rescue-system on the go... without the need to burn different CDs or USB pendrives.

DriveDroid also includes a convenient download menu where you can download USB-images of a number of operating systems from your phone.
You can also create USB-images which allows you to have a blank USB-drive where you can store files in. Blank images also allow you to use tools on your PC to burn images to the drive and create a bootable USB disk that way.

* [DriveDroid (Free) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid)
* [DriveDroid (Paid) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid.paid)
* [DriveDroid Beta](https://groups.google.com/d/forum/drivedroid)
* [Changelog and downloads](/apps/drivedroid/versions.html)
* [DriveDroid on XDA-Developers](http://forum.xda-developers.com/showthread.php?t=2196707)
* [#drivedroid on irc.freenode.net](http://webchat.freenode.net?channels=drivedroid)
* [Distributions downloadable through DriveDroid](http://softwarebakery.com/apps/drivedroid/distributions.html)

If you like DriveDroid, feel free to [donate](/donate).

<div class="gallery">
    <img src="drivedroid/drivedroid-20130322T183128.png" />
    <img src="drivedroid/drivedroid-20130322T183906.png" />
    <img src="drivedroid/drivedroid-20130322T183146.png" />
    <img src="drivedroid/drivedroid-20130322T183212.png" class="landscape" />
</div>

## True CD-rom emulation

Most phones emulate an USB stick when using DriveDroid. This is baked into the kernel of your phone. This means that only images that are compatible with USB sticks can be used. All IMG files will work, but not all ISO files will.

Most modern Linux systems distribute their ISOs as hybrid files. This means the ISO files will work on a CD as well as from an USB stick.

Other ISO files, like Windows, will not work as an USB stick. For these images there are 2 options: converting them or enabling true CD-rom emulation on your phone.

Converting images is for most people the best option. I have written a tutorial on how to [convert those images to be compatible with USB](/using-rufus-to-create-bootable-usb-images).

Enabling true CD-rom emulation on your phone will enable your phone to not only be an USB stick, but also look like a real CD-rom drive. This should allow you to boot *any* ISO file from your phone.

To get CD-rom emulation support you need to install a custom kernel or rom on your phone that supports this feature. You can find out which roms do on [the XDA forums](http://forum.xda-developers.com/showthread.php?t=2196707) under 'True CD-rom emulation'.

## Tutorials

* [Installing ISOs on DriveDroid](/using-rufus-to-create-bootable-usb-images)
* [Windows installation on DriveDroid](/windows-install-on-drivedroid)
* [Install Hirens Boot CD on DriveDroid](/install-hirensbootcd-on-drivedroid)
* [Shrinking images on Linux](/shrinking-images-on-linux)

## Notes

* DriveDroid requires a rooted Android system
* Some .iso files do not support being booted over USB, but most popular Linux distibutions are. All images that are downloadable through DriveDroid are supported.
* Do NOT use DriveDroid while your SD card is mounted (being used on your PC). This can cause loss of data.
* DriveDroid requires support for USB mass storage on your phone. Most devices have this (even ones that do not use it by default). However some phones or tablets have trouble with mass storage. If your phone or tablet does not seem work with DriveDroid, send me a support email through DriveDroids preferences.
