Title: Recovering commits with Git
Author: FrozenCow
Date: 13 Januari 2012 22:42:00 +0200

Git is pretty powerful. With this power it allows you to do amazing things. Recently I've come to realize that you can hurt yourself pretty badly with its powers. Operations like resetting and fast-forwarding are dangarous and should be used with care.

Today I did not handle them with care and commits seemed to be lost. Luckily I found that Git does not delete commits. My lost commits were just not referenced by any branch or tag, but were 'dangling'. The problem is finding these commits back.

I found two possible commands that helped me find my lost commits: `git reflog` and `git fsck --lost-found`.

### Reflog
This command shows the history of operations you have done on your repository. Each operation is shown with the hash of the commit that it results in. As an example we will create a repository, commit a change, 'lose' the commit and find it back using `git reflog`.

First we create a test repository:

    $ mkdir myrepo
    $ cd myrepo
    $ git init

Next we'll commit a file with some text:

    $ echo some text in a file > file
    $ git add file
    $ git commit -m "My first change"

Now we'll make a change to the file:

    $ echo other text in a file > file
    $ git commit file -m "Another change to file"

You can see the current commits in the log:

    $ git log --oneline
    fd9e098 Another change to file
    98b88cc My first change

Now we make our mistake and reset to the first commit:

    $ git reset --hard HEAD~1

Our second commit is now 'lost'. We can see that the file does not match the latest change we made and the log does not show our latest commit anymore:

    $ cat file
    some text in a file
    $ git log --oneline
    98b88cc My first change

Presume we haven't done the previous logs and don't know the hash of the latest commit that we have done. We can see the operations we did using reflog:

    $ git reflog
    98b88cc HEAD@{0}: reset: moving to HEAD~1
    fd9e098 HEAD@{1}: commit: Another change to file
    98b88cc HEAD@{2}: commit (initial): My first change

Two commits and a reset, that seems to fit with what we did. Commit 'fd9e098' seems to be the one we're missing. We can take a look at the history of that commit to get a better understanding whether it really is the right one:

    $ git log fd9e098 --oneline
    fd9e098 Another change to file
    98b88cc My first change

This seems to be in line with what we previously saw, so now we want to get back that last commit. We have the option to just reset our history to that commit by using `git reset --hard`:.

    $ git reset --hard fd9e098

The history is now the same as before:

    $ git log
    fd9e098 Another change to file
    98b88cc My first change

If you weren't sure it was the right commit yet, you can do a checkout of the commit before resetting to look at its files more easily:

    $ git checkout fd9e098

Though do remember to checkout to your previous branch when you're done going through its files:

    $ git checkout master

### Lost and found
Instead of using `git reflog` to find your lost commits, you can also use Git's fsck to find 'dangling' commits for you. If we go back to our example we can do a reset again to 'lose' our latest commit:

    $ git reset --hard 98b88cc

Now if we issue the lost and found command. It'll return the dangling commit(s) that were lost:

    $ git fsck --lost-found
    dangling commit fd9e0982eaf3d8589aac26f0c6a52be5741ee8f7

We can do the same as before and reset to that commit:

    $ git reset --hard fd9e0982eaf3d8589aac26f0c6a52be5741ee8f7

Now the history is restored and the files are of the latest commit.

### Garbage collection

Even though the dangling commits exist at this time, they will be removed after a garbage collection. Git automatically does this for files that are 2 weeks old. Garbage collection can also be disabled by using the configuration value `gc.auto`:

    $ git config --global gc.auto 0

To do garbage collections manually you could use:

    $ git gc

More information on this can be found on [git-gc manual page](http://linux.die.net/man/1/git-gc).

