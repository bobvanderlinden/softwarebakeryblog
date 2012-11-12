Title: DriveDroid 0.5 released!
Author: FrozenCow
Date: 12 November 2012 21:13:00 +0200

DriveDroid allows you to boot your PC from ISO/IMG files stored on your phone. This is ideal for trying Linux distributions or always having a rescue-system on the go... without the need to burn CDs or USB pendrives.

DriveDroid also includes a convenient download menu where you can select a popular distibution to download and use.

## How do you make this work?

* Connect your phone to your PC using an USB cable
* Download an image file (.iso or .img) through DriveDroid or download them manually
* Select the image file in DriveDroid to let your phone 'host' the file over USB
* (Re)start your PC and make sure the correct boot priority is set in the bios
* The image should now be booted on your PC

## Requirements

* Root
* USB cable (from phone to PC)
* USB Mass Storage-support should be enabled on your ROM (being able to mount SD card)

## Notes

* Some .iso files do not support being booted over USB, but most popular distibutions are. All images that are downloadable through DriveDroid are supported.
* All .img files should work fine.
* It is recommended to download distributions over wifi: those files are big!
* Do NOT use DriveDroid while your SD card is mounted (being used on your PC). This can cause loss of data.

The downloads that DriveDroid provides are gathered using [distscraper](http://github.com/FrozenCow/distscraper). If you want other distributions to be includes in the list, please [open up an issue](https://github.com/FrozenCow/distscraper/issues) or do a pull request.
