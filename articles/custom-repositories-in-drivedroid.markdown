Title: Custom repositories in DriveDroid
Author: FrozenCow
Date: 31 August 2014 11:00:00 +0200

In recent versions of [DriveDroid](http://softwarebakery.com/projects/drivedroid), custom download repositories were added. This means that, in addition to [the standard set of freely available images that are already downloadable through in DriveDroid](http://softwarebakery.com/apps/drivedroid/distributions.html), you can add your own. Basically this is a way to add images to the download list and share them. This can be useful for organizations to share images in their team. In particular images that aren't freely available or images that has very specific custom tools or applications. Examples include:

* Windows installation disks
* Non-free recovery and backup tools
* Bios flashing utilities
* Custom built images

## Requirements

DriveDroid needs two parts:

* The images you want to share
* The repository file

Both of these need to be hosted on a HTTP(S) webserver. However, you may host them on separate webservers.

If the images are already hosted on a HTTP(S) server (and directly linkable), you only need the repository file to direct DriveDroid to them.

If you have small images that you want to share with a set number of people you can use easy hosting solutions like [Dropboxs public folder](https://www.dropbox.com/help/16).

However, large images or ones that are going to be downloaded often will need your own webserver. That said, no special settings are required for this to work.

In this article we will assume you have an image called `mycustomimage.iso` and you've placed it on your webserver.

## Repository file

The repository file is a JSON formatted file that links to the various images that you want to see in DriveDroid. The structure is as follows:

    [{
        "id": "mycustomimages",
        "name": "My Custom Images",
        "url": "http://www.my-custom-images.org/",
        "imageUrl": "logos/mycustomimages.png",
        "releases": [{
            "version": "1.0",
            "url": "images/mycustomimage.iso",
            "size": 4194304,
            "arch": "amd64"
        }]
    }]

This represents a list of distributions. Each distribution has the following properties:

* `id` (*required*): a unique lower-case identifier of the distribution
* `name` (*required*): the name (or title) of the distribution
* `url` (*required*): a URL to the website of the distrution. This is will show a website-button in the actionbar when the distribution is selected.
* `imageUrl` (*optional*): a relative or absolute URL to a logo for the distribution. The file should be a 48 x 48 PNG.
* `releases` (*required*): a list of the releases that the distribution has.

A release is essentially an image with some metadata. Each release has the following properties:

* `url` (*required*): the relative or absolute url where the image is located.
* `size` (*required*): the size of the image in bytes. This is shown as KB/MB/GB/TB in the image download list.
* `version` (*optional*): the version of the release.
* `arch` (*optional*): the architecture of the release.

Note that `version` and `arch` aren't shown anywhere in the GUI. At the moment they are only used for sorting (first by version, then by architecture).

The `imageUrl` of the distribution and the `url` of a release can both be relative as well as absolute. That means you can conveniently refer to `logos/mycustomimages.png`, which is be relative to the repository file, instead of using the full URL.

If no `imageUrl` is given, DriveDroid will take `logos/{id}.png` as the `imageUrl` by default. So in the example above, leaving `imageUrl` out would've had the same effect.

## Directory structure

Although you're free to use any structure, the example above assumes a structure like:

* `myrepository.json`: the repository file as described above
* `logos/mycustomimages.png`: the logo for "My Custom Images"
* `images/mycustomimage.iso`: the image

Let's say you're hosting this on `http://www.my-custom-images.org/`, then the URL for the repository would be `http://www.my-custom-images.org/myrepository.json`. This is what you'll configure DriveDroid with.

## Configure DriveDroid

To add the new repository to DriveDroid, you would do the following:

* Go to Preferences
* Go to Image repositories
* Press +
* Enter a name of your choice, for example "My Custom Repository"
* Enter the URL of your repository, for example `http://www.my-custom-images.org/myrepository.json`
* Press ✓ (Save)
* For demonstration purposes disable "DriveDroid main" and "DriveDroid syslinux"
* Done

To view your new repository:

* Go to DriveDroids main screen
* Press +
* Press "Download images..."

Now you should see "My Custom Images" listed.

## Examples

The example above is also available at `http://softwarebakery.com/apps/drivedroid/repositories/mycustomrepository.json`.

For bigger examples, you can have a look at the official repositories that DriveDroids ships with:

* [main.json](http://softwarebakery.com/apps/drivedroid/repositories/main.json) ([formatted nicely](http://jsonformatter.curiousconcept.com/#http://softwarebakery.com/apps/drivedroid/repositories/main.json))
* [syslinux.json](http://softwarebakery.com/apps/drivedroid/repositories/syslinux.json)  ([formatted nicely](http://jsonformatter.curiousconcept.com/#http://softwarebakery.com/apps/drivedroid/repositories/syslinux.json))

These files were generated using [distscraper](https://github.com/FrozenCow/distscraper), a tool that runs periodically to scrape the various distributions for new images.

The logos for these repositories are in the `logos` subdirectory, for instance [logos/debian.png](http://softwarebakery.com/apps/drivedroid/repositories/logos/debian.png).