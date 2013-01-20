Title: DriveDroid 0.7.0 released
Author: FrozenCow
Date: 20 Januari 2012 23:01:00 +0200

Version 0.7.0 of [DriveDroid (Free)](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid) and [DriveDroid (Paid)](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid.paid) is just released. This version comes with quite a few changes. Here is the changelog:

* Added 'Create blank image' to create an empty/FAT32 disk-image
* Improved USB Mass Storage option
* Improved support emails
* Option to check for USB Mass Storage
* Changed menu structure for creating/adding/downloading images
* Added support for HTC Sensation, Samsung GT-S5360 and HDC i9300
* Fixed crash when going to preferences without root

## Create blank image

The biggest feature is the ability to create blank images from within DriveDroid. You can specify the size that you want the USB-disk to have and DriveDroid can format a FAT-32 filesystem on it (big thanks to [fat32-lib](http://code.google.com/p/fat32-lib/)). Once you select the image you'll see an empty USB-disk on your PC where you can store files.

One advantage of this system is not just being able to store files, but to be able to use any tool on your PC to create bootable USB drives. In the past a number of ISOs were not loadable by DriveDroid, because those weren't USB compatible. Now you can use tools like [Windows 7 USB/DVD download tool](http://www.microsoftstore.com/store/msstore/html/pbPage.Help_Win7_usbdvd_dwnTool), [UNetBootin](http://unetbootin.sourceforge.net/), [Image Writer](https://launchpad.net/win32-image-writer) or just [dd](http://linux.die.net/man/1/dd) to write images or ISOs to a disk you created+hosted using DriveDroid.

## Compatiblity

I've also tried to support devices that do not have USB Mass Storage by default. Use the 'USB Mass Storage (UMS)'-option in the preferences of DriveDroid to enable UMS. It will use the normal way of enabling UMS, but will try to detect whether this does not work and use other methods to enable it. Hopefully this will work for some devices.

For anyone who still has trouble, please send me a support email through the preferences of DriveDroid. Support emails now contain more information, so it should have a better chance of solving the problem.