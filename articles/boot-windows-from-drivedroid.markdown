Title: Boot Windows 8 from DriveDroid
Author: FrozenCow
Date: 21 November 2014 13:31:00 +0200

In [previous](/using-rufus-to-create-bootable-usb-images) [tutorials](windows-install-on-drivedroid) we've seen how to write a Windows installation ISO to an USB drive. This allowed you to start the Windows installer from your phone. What if you could run Windows itself from your phone instead of just the installer? That would make it possible to have an installation of Windows always with you. This is what we'll show in this tutorial.

First off, many thanks to [xyancompgeek](http://forum.xda-developers.com/showpost.php?p=56795760&postcount=883) for his post on XDA-developers. It is what I'm basing this tutorial on.

<iframe width="560" height="315" src="//www.youtube.com/embed/cuInQ55FcX4" frameborder="0" allowfullscreen></iframe><br/>

# Requirements

* [DriveDroid](https://play.google.com/store/apps/details?id=com.softwarebakery.drivedroid) v0.7.0+
* 5.5GB free space on your Android phone
* A phone that supports files greater than 4GB (most Android 4.1+ phones)
* A PC with Windows 7 or 8
* [WimLib](http://sourceforge.net/projects/wimlib/)
* A Windows 8+ installation ISO

# Image creation

First hook up your phone to your PC using a USB cable.

Next we'll have to create a blank image on your phone. On this image we will eventually store the installation disk. In DriveDroid we go to the + button and choose 'Create blank image...'.

<img src="boot-windows-from-drivedroid/drivedroid-01.png" class="box" />

Choose a filename like 'windows8.img' and choose 5500MB as the size for the image. You can uncheck 'Partition table (MBR)' and choose 'None' for the filesystem. Now hit the 'Create' button on the top-right.

As a side-note, we choose to not create a partition table and filesystem here because DriveDroid does not support formatting NTFS filesystems. NTFS is required and Windows does a good job creating a partition table and formatting the NTFS filesystem, but we'll get to that.

<img src="boot-windows-from-drivedroid/drivedroid-02.png" class="box" />

This will create the image file in the background. Open the notification-bar to see when the image creation is finished.

Your phone probably has a hard time while it's allocating the file, so it's best not to do anything else while it's working.

<img src="boot-windows-from-drivedroid/drivedroid-03.png" class="box" />

Once the image is created go to DriveDroid.

# Partitioning and formatting

Select the image in DriveDroid and click the option that says 'Writable USB'. As soon as we have done that, Windows will find a new USB drive.

Go to start and type `cmd.exe`. Right-click 'Command Prompt' and choose 'Run as Administrator'.

<img src="boot-windows-from-drivedroid/partition-01.png" class="box" />

Start diskpart by typing `diskpart`.

<img src="boot-windows-from-drivedroid/partition-02.png" class="box" />

Show the connected disks by typing `list disk`.

<img src="boot-windows-from-drivedroid/partition-03.png" class="box" />

You will see that the image you just created in DriveDroid is listed here as a disk of 5500MB. In this example it is listed as Disk 3.

To work on disk 3, we need to select it by typing `select disk 3`.

<img src="boot-windows-from-drivedroid/partition-04.png" class="box" />

First we remove anything that's already on the disk (if any), by typing `clean`.

<img src="boot-windows-from-drivedroid/partition-05.png" class="box" />

Now we can create a partition by typing `create partition primary`.

<img src="boot-windows-from-drivedroid/partition-06.png" class="box" />

The partition doesn't have a filesystem yet. For the Windows 8 disk we need a NTFS filesystem. We can format a NTFS filesystem on the partition by typing `format fs=ntfs quick`.

<img src="boot-windows-from-drivedroid/partition-07.png" class="box" />

Now we have a partition table, partition and filesystem. We only have to mark the partition as 'bootable' to be able to boot from it. We do this by typing `active`.

<img src="boot-windows-from-drivedroid/partition-08.png" class="box" />

Finally we leave diskpart by typing `exit`. You can close the window after that.

<img src="boot-windows-from-drivedroid/partition-09.png" class="box" />

Now we have a disk that has a filesystem. We should be able to see the empty disk in Windows Explorer. In this example it is disk F:.

<img src="boot-windows-from-drivedroid/partition-10.png" class="box" />

Remember the drive letter 'F:'. We need it later.

Optionally we can make sure the disk compresses all files. This will potentially make some more room for files.

<img src="boot-windows-from-drivedroid/compress-01.png" class="box" />

Right-click the drive in Windows Explorer and choose 'Properties'.

<img src="boot-windows-from-drivedroid/compress-02.png" class="box" />

Next check 'Compress this drive to save disk space' and hit 'OK'.

# Copying files

The necessary files are on the ISO in a file called 'install.wim'. We will use WimLib to extract this file to the new filesystem.

<img src="boot-windows-from-drivedroid/copy-01.png" class="box" />

First go to your ISO and double-click it in Windows Explorer. It should open up the ISO and show the contents.

<img src="boot-windows-from-drivedroid/copy-02.png" class="box" />

Notice that it also created a drive letter for the ISO. In this example it is 'G:'. Remember this drive letter.

Next we need [WimLib](http://sourceforge.net/projects/wimlib/). Download and extract it to a location that you can easily access. For this example we extracted it in 'C:\WimLib'.

Use the same Command Prompt as before to navigate to the WimLib directory.

<img src="boot-windows-from-drivedroid/copy-03.png" class="box" />

Next we extract the contents from 'install.wim', which is on the ISO, to the disk. Here we need to use the drive letter of your phone (F: in this example) and the drive letter of the ISO (G: in this example). We instruct WimLib using `wimapply G:\sources\install.wim F:\ --strict-acls`.

<img src="boot-windows-from-drivedroid/copy-04.png" class="box" />

After quite a while it has placed all the necessary files onto the drive.

<img src="boot-windows-from-drivedroid/copy-05.png" class="box" />

Next we will make sure we can boot from the drive using `bootsect /nt60 F:`.

<img src="boot-windows-from-drivedroid/copy-06.png" class="box" />

And make sure the necessary files for booting are also there `bcdboot F:\Windows /s F: /f ALL`.

All done! Now do make sure you safely remove the USB drive from Windows and unplug the USB cable.

# Booting Windows

Plug in the USB cable into the PC where you want to boot. Start the PC and make sure your phone is used as the boot device.

<img src="boot-windows-from-drivedroid/boot-01.jpg" class="box" />

Next Windows 8 will load and will do some initial setting up. After it has done this, it'll reboot. Make sure you are again booting from the phone.

<img src="boot-windows-from-drivedroid/boot-02.jpg" class="box" />

Booting a second time will actually bring you to Windows and you can configure it to your liking. Have fun!
