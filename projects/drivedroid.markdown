Title: DriveDroid

DriveDroid is an Android application that allows you to boot your PC from ISO/IMG files stored on your phone. This is ideal for trying Linux distributions or always having a rescue-system on the go... without the need to burn different CDs or USB pendrives.

DriveDroid also includes a convenient download menu where you can download USB-images of a number of operating systems from your phone.
You can also create USB-images which allows you to have a blank USB-drive where you can store files in. Blank images also allow you to use tools on your PC to burn images to the drive and create a bootable USB disk that way.

* [DriveDroid (Free) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid)
* [DriveDroid (Paid) on Google Play](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid.paid)
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

## How do you make this work?

* Download and install DriveDroid
* Connect your phone to your PC using an USB cable
* Download an image file (.iso or .img) through DriveDroids downloadlist.
* Select the image file in DriveDroid to let your phone 'host' the file over USB
* (Re)start your PC and make sure the correct boot priority is set in the bios
* The image should now be booted on your PC

## True CD-rom emulation

Most phones emulate an USB stick when using DriveDroid. This is baked into the kernel of your phone. This allows you to use images that are compatible with USB sticks, but if ISO files do not support this, you need to [convert those images to be compatible with USB](/using-rufus-to-create-bootable-usb-images). Another possibility is making your phone emulate a CD-rom drive instead of an USB stick. This allows you to use *any* ISO file and boot from it.

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

## Version history

<pre class="scrollable">
v0.8.1
* Fixed not being able to restore USB mode for some devices.
* Fixed images not showing up when there's one available.
* Fixed refreshing the imagelist when adding/editing images.

v0.8.0
* Notifications for image hosting.
* Setup guide for first time use and device compatibility testing.
* Blacklist/whitelist in setup guide that checks whether device is found to be compatible or not.
* Ability to choose different USB systems for better device compatibility.
* Automatic USB mode switching upon hosting images.
* Nicer host dialog with descriptions for each button and a help button.
* Manually changing USB mode and persistent USB mode individually (was always combined in 0.7.7). This means DriveDroid will usually keep persistent USB settings, that are stored across reboots, untouched.
* Ability to turn off automatic USB mode switching for people who want to switch manually.
* Better support for symlinked LUNs (avoids duplicates).
* Better and more detailed support emails.
* Added super-user permission.
* Support for some WonderMedia devices.
* Support for Samsung Galaxy Tab P1000 N and L.
* Support for some HUAWEI devices.
* Fixed image creation where it can now create FAT images of 4MB, whereas previously it was only possible to create 32MB and higher. (FAT12/16/32 issue)

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
* Fixed compatibility with pre-jellybean Android phones

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