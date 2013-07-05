Title: DriveDroid

DriveDroid is an Android application that allows you to boot your PC from ISO/IMG files stored on your phone. This is ideal for trying Linux distributions or always having a rescue-system on the go... without the need to burn different CDs or USB pendrives.

DriveDroid also includes a convenient download menu where you can download USB-images of a number of operating systems from your phone.
You can also create USB-images which allows you to have a blank USB-drive where you can store files in. Another possibility is to use tools on your PC to make a bootable USB-drive out of the blank image that DriveDroid created.

* [DriveDroid (Free) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid)
* [DriveDroid (Paid) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid.paid)
* [DriveDroid Beta](http://softwarebakery.com/apps/drivedroid/files/drivedroid-free-0.7.8-79f475b.apk)
* [DriveDroid on XDA-Developers](http://forum.xda-developers.com/showthread.php?t=2196707)
* [#drivedroid on irc.freenode.net](http://webchat.freenode.net?channels=drivedroid)

If you like DriveDroid, feel free to [donate](/donate).

<div class="gallery">
    <img src="drivedroid/drivedroid-20130322T183128.png" />
    <img src="drivedroid/drivedroid-20130322T183906.png" />
    <img src="drivedroid/drivedroid-20130322T183146.png" />
    <img src="drivedroid/drivedroid-20130322T183212.png" class="landscape" />
</div>

## How do you make this work?

* Download and install DriveDroid
* Connect your phone to your PC using an USB cable
* Download an image file (.iso or .img) through DriveDroids downloadlist.
* Select the image file in DriveDroid to let your phone 'host' the file over USB
* (Re)start your PC and make sure the correct boot priority is set in the bios
* The image should now be booted on your PC

## Tutorials

* [Windows installation on DriveDroid](/windows-install-on-drivedroid)
* [Install Hirens Boot CD on DriveDroid](/install-hirensbootcd-on-drivedroid)
* [Shrinking images on Linux](/shrinking-images-on-linux)

## Notes

* DriveDroid requires a rooted Android system
* Some .iso files do not support being booted over USB, but most popular Linux distibutions are. All images that are downloadable through DriveDroid are supported.
* Do NOT use DriveDroid while your SD card is mounted (being used on your PC). This can cause loss of data.
* DriveDroid requires support for USB mass storage on your phone. Most devices have this (even ones that do not use it by default). However some phones or tablets have trouble with mass storage. If your phone or tablet does not seem work with DriveDroid, send me a support email.

## Version history

<pre class="scrollable">
v0.7.7
* Fixed crash for some phones where USB-mode couldn't be determined
* Made acquiring root in preference asynchonous (for some phones this takes too long)
* Added None as an USB-mode

v0.7.6
* Replaced UMS-switch with USB-mode list
* Added check for Android Debugging
* Added extension for image creation
* Added website and donation button
* Tweaked image creation so that it doesn't hog the system
* Fixed rare crash (AdMob bug)
* Fixed rare crash (freeSpace)

v0.7.5
* Fixed compatiblity with pre-jellybean Android phones

v0.7.4
* Added support for cdrom devices (for supported kernels/roms)
* Added support for XOLO X900
* Added extra device for Exagerate XZPAD750
* Added support for Nexus 10 (CyanogenMod nightlies)
* Removed aliased devices due to symlinks
* Added nicer icons for host-devices
* Added nicer host-device selection
* Better root checking
* Better logging for image creation
* Again more info for support email
* Fixed error reporting when image creation fails
* Fixed typos

v0.7.3
* Added support for Softwinners devices
* Added support for Rockchip devices
* Added support for Sony Xperia
* Added support for Softwinner Diva
* Alternative way of image creation (to workaround 2GB device limitations)
* Added progressbar to image creation
* Added website button for distributions
* Fixed read-only SDcard when choosing None
* Fixed contextmenu of images
* Added reboot recommendation when enabling UMS

v0.7.2
* Added read-only/read-write options to device selection
* Added support for HTC One X
* Added support for WonderMedia
* Reworked device detection
* Added compatiblity for more devices when generating support email

v0.7.1
* Fixed crash when generating support-email
* Fixed add submenu not being showed on Android 2.3.x

v0.7.0
* Added 'Create blank image' to create an empty/FAT32 disk-image
* Improved USB Mass Storage option
* Improved support emails
* Option to check for USB Mass Storage
* Changed menu structure for creating/adding/downloading images
* Added support for HTC Sensation, Samsung GT-S5360 and HDC i9300
* Fixed crash when going to preferences without root

v0.6.3
* Added USB Mass Storage toggle to switch the Android-device between MTP and UMS.
* Better support emails, which first gathers system information before sending a mail.
* Added button in preferences to send a support email.

v0.6.2
* Added logos of distributions
* Fixed crash when furiously hitting refresh-button

v0.6.1
* Fixed crash when no DownloadManager is available (< Android 2.3)
* Added cache and refresh-button for distributionlist

v0.6.0
* Fixed back buttons in titlebar
* Set minimal API level to 8 (from now only Android 2.2 and up are supported)
* Fixed compatiblity with Android 2.2
* Disabled downloading when no DownloadManager is found (Android 2.3 and below)

v0.5.9
* Fixed issue with SliTaz crashing distribution-list

v0.5.8
* Added version to title
* Added paid (ad-free) version to Play Store

v0.5.7
* Fixed crash when distributions could not be retrieved

v0.5.6
* Show message when downloading outside SD card (which isn't allowed by Android)
* Fixed rare crash

v0.5.5
* Added f_mass_storage (non-ex) and musb-omap2430 support
* Fixed crash when downloading images

v0.5.4
* Added support for f_mass_storage, fsl-tegra-udc and msm_hsusb.

v0.5.3
* Detects when no USB mass storage support is found
* Fix when su is not found (device is not rooted)

</pre>