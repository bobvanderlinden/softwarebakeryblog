Title: Building the Android kernel on Linux
Author: FrozenCow
Date: 19 December 2014 16:30:00 +0200

When you want to add extra functionality to your kernel, you want to develop your own functionality or just want to have your own version of the kernel, you will want to build kernel code.

In this tutorial we will go through the whole process of retrieving, compiling, (optionally) patching and flashing kernels that are based on AOSP. As an example we will use the kernel of the Nexus 5 (hammerhead). We'll presume this is all done on a Debian or Ubuntu machine, since that is most popular while still practical.


# Requirements

On Debian/Ubuntu you need the following packages:

* git
* build-essential
* abootimg
* adb and fastboot

Install these using:

    sudo apt-get install git build-essential abootimg

And install the Android SDK as described [here](https://developer.android.com/sdk/installing/index.html?pkg=tools) to get adb and fastboot.

# Retrieving the kernel

Check what kernel your phone needs on [https://source.android.com/source/building-kernels.html](https://source.android.com/source/building-kernels.html).

In this example we'll build the kernel for the Nexus 5. The code-name of the Nexus 5 is `hammerhead`, which is listed in the table under 'Figuring out which kernel to build'. Take note of the 'Build configuration' (in this example: `hammerhead_defconfig`) and 'Source location' (in this example: `kernel/msm`). We see these coming back in later steps.

Next we look up what exact version of the kernel we want to retrieve. We open up Google's git repository of your device online by going to the following URL:

[https://android.googlesource.com/kernel/msm](https://android.googlesource.com/kernel/msm)

*Note that you need to replace `kernel/msm` with the 'Source location' of your device.*

On that page you can look under 'Branches' to see the different versions available. In this example we will be using `android-msm-hammerhead-3.4-lollipop-release`.

Next we retrieve the kernel from Google by using the following:

    git clone https://android.googlesource.com/kernel/msm --branch android-msm-hammerhead-3.4-lollipop-release linux

*Note that you need to replace `kernel/msm` with the 'Source location' of your device and replace `android-msm-hammerhead-3.4-lollipop-release` with the branch of your device.*

This retrieves all source code (and its history) from Google and places it all under a new directory called `linux`.

# Patching the kernel

This step isn't needed if you just want to build your own kernel. Continue with [Compiling the kernel](#Compiling the kernel) if that's the case.

A note on patches: patches come in all kinds of forms. There are files (`.patch` or `.diff`) that simply contain changes to certain lines in certain files. Patches are also embedded in version control systems, like Git. There are different ways to retrieve them and different ways to apply them.

Secondly, patches won't always fit perfectly onto your current code. When a patch cannot be applied to your kernel means that there have been changes made in sections that the patch also touches. These are called conflicts. These conflicts must be solved by the user. We will not cover conflicts in this tutorial, but you can find [more information on conflicts on Github](https://help.github.com/articles/resolving-a-merge-conflict-from-the-command-line/).

In this example we will apply a patch that was submitted to CyanogenMod to add CD-rom functionality to DriveDroid on Nexus 5 devices/kernels. The patch can be found on CyanogenMods code reviewing system: http://review.cyanogenmod.org/#/c/57792/

First change the current directory to the kernel:

    cd linux

Now we can apply `git` commands on the source code of Linux.

On the [page of the patch on CyanogenMods code reviewing system](http://review.cyanogenmod.org/#/c/57792/) you'll find a few options to download the patch: checkout, pull, cherry-pick and patch. We will use the cherry-pick option, since it is most straight-forward for our purpose. Click cherry-pick and copy the command that shows up under it. In this example the command is the following:

    git fetch http://review.cyanogenmod.org/CyanogenMod/android_kernel_lge_hammerhead refs/changes/92/57792/2 && git cherry-pick FETCH_HEAD

Execute this command. It results in the following output:

    From http://review.cyanogenmod.org/CyanogenMod/android_kernel_lge_hammerhead
     * branch            refs/changes/92/57792/2 -> FETCH_HEAD
    [android-msm-hammerhead-3.4-lollipop-release 3f1a563] usb: gadget: mass_storage: added sysfs entry for cdrom to LUNs
     Date: Thu Jul 4 12:36:57 2013 +0200
     2 files changed, 42 insertions(+)

This means the patch has been applied. Change the current directory back to the parent to continue the tutorial:

    cd ..

# Compiling the kernel

Since most phones and tablets run on an ARM processor, we need a compiler that targets ARM. It's best to use the exact same compiler Google uses, so we'll retrieve that using the following:

    git clone https://android.googlesource.com/platform/prebuilts/gcc/linux-x86/arm/arm-eabi-4.6 arm-eabi-4.6

Next we need to instruct the build process to use the compiler:

    export PATH=$PWD/arm-eabi-4.6/bin:$PATH
    export ARCH=arm
    export SUBARCH=arm
    export CROSS_COMPILE=arm-eabi-

Now we need to configure Linux, like what modules it should include. In this case we want just the default configuration for the Nexus 5 (hammerhead):

    make -C linux hammerhead_defconfig

Finally we can compile the kernel:

    make -C linux

This will take a while. When compilation has finished, the kernel is available under `linux/arch/arm/boot/zImage-dtb`.

# Preparing a boot image

We have the kernel. Next we need to package it up into a bootloader image. A bootloader image usually consists of:

* A kernel image
* A ramdisk image
* A kernel command-line

We already have the kernel image, but the ramdisk and kernel commandline are also required. These are dependent on the rom you're using. So, we use the same bootloader image from your rom and replace the kernel.

First retrieve the factory image from: [https://developers.google.com/android/nexus/images](https://developers.google.com/android/nexus/images)

You can use your own methods to download and extract the image. In this example we use command-line tools to do this.

In this example we'll presume you're using `hammerhead-lrx21o-factory-01315e08.tgz`. To download it use:

    wget https://dl.google.com/dl/android/aosp/hammerhead-lrx21o-factory-01315e08.tgz

Next extract `image-hammerhead-lrx21o.zip` from `hammerhead-lrx21o-factory-01315e08.tgz`:

    tar xfz hammerhead-lrx21o-factory-01315e08.tgz image-hammerhead-lrx21o.zip

And now extract `boot.img` from `image-hammerhead-lrx21o.zip`:

    unzip image-hammerhead-lrx21o.zip boot.img

We have an Android boot image which contains a stock kernel, ramdisk and command-line. We extract all of these using:

    abootimg -x boot.img

This results in the following files:

* `bootimg.cfg`: configuration with addresses, sizes and the kernel commandline.
* `zImage`: the stock kernel
* `initrd.img`: the stock ramdisk

We will use the same configuration file and ramdisk.

We do need to make a small change to the configuration though. I found that my compiled kernel image was bigger than the stock kernel. The size of the kernel is set in the configuration file (`bootimg.cfg`) to the size of the stock kernel, so this needs to change. Since `aboot` can determine the size itself when it's packing everything up, we can just remove the bootsize from the configuration. Open `bootimg.cfg` with your favorite editor and remove the line with `bootsize =`. Alternatively use the following line to do the same:

    sed -i '/bootsize =/d' bootimg.cfg

Now we can create our custom boot image. We name it `newboot.img` using the following line:

    abootimg --create newboot.img -f bootimg.cfg -k linux/arch/arm/boot/zImage-dtb -r initrd.img

Yay, we now have an image that we can flash onto the phone/tablet.

# Boot using boot image

To try the boot image and kernel you need to reboot into your bootloader on your phone/tablet (aka fastboot mode). You can usually do this by shutting down your phone and holding down Volume Down and the power button. Alternatively you can use:

    adb reboot bootloader

You should see some lines of text starting with `FASTBOOT MODE`. Now you can boot your phone with your new boot image:

    fastboot boot newboot.img

Try whether things work correctly. If it does, you can make the boot image permanent by flashing it onto your phone.

# Flash boot image

To make the boot image permanent you can again reboot to your bootloader:

    adb reboot bootloader

And flash the boot image:

    fastboot flash boot newboot.img

The next time you reboot your phone it'll start using your own compiled kernel. Have fun!
