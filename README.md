# Dhamma.Gift - Liberation Search Engine

Dhamma.Gift is available as:

- Website: [https://dhamma.gift](https://dhamma.gift)
- PWA (installable via browser on Android and desktop)
- APK files for manual installation:
  [Download dhamma.gift-v0.1.apk](https://dhamma.gift/assets/apk/dhamma.gift-v0.1.apk)
  [Download dict.dhamma.gift-v0.1.apk](https://dhamma.gift/assets/apk/dict.dhamma.gift-v0.1.apk)

## online version

Grep-based search in all Texts of Pali Suttanta and Vinaya in 4 languages: Pali, English, Russian, Thai and Sinhala. Little script that will or at least might change Buddhism to better.
Search all matches for the word in Suttas and Vinaya.
Web implementation of bash script that generates comfortables datatables.

https://dhamma.gift/

Perfect for those who are looking for Awakening and study Pali.
You can get all occurrences of the definition, metaphor, practice etc.
By default search is made in DN, MN, SN, AN. But user has option to add other books of KN.

## dg.offline

Offline version of dg

This instruction is only for Android devices. Check possible options for IOS in the end of this instruction. if you'll find out how to run it on IOS please let me know.

### Option #1 - installation with script

#### For Linux with apt

Copy+paste into terminal

```bash
sudo bash 
wget https://raw.githubusercontent.com/dhammagift/dg/refs/heads/main/scripts/install-linux.sh
bash install-linux.sh
```

#### For Windows 10+ (WSL)

1. [Activate](https://learn.microsoft.com/en-us/windows/wsl/install) Windows Subsystem for Linux
1. Install Ubuntu of your choice from Windows store
1. Finalize the setup: set username and password
1. ```bash
   sudo bash 
    wget https://raw.githubusercontent.com/dhammagift/dg/refs/heads/main/scripts/install-linux.sh
    bash install-linux.sh
   ```
   
#### For Android

1. Install Termux from [F-Droid](https://f-droid.org/packages/com.termux/) or [GitHub](https://github.com/termux/termux-app). The Play store version doesn't work properly.

1. Run Termux

1. Copy-paste following commands:

   ```bash
   pkg install wget
   wget https://raw.githubusercontent.com/dhammagift/dg/refs/heads/main/scripts/install-android.sh
   bash install-android.sh
   ```
    or older variant    

    ```bash
    pkg update
    pkg upgrade
    pkg install -y git
    mkdir -p $PREFIX/share/apache2/default-site/htdocs
    cd $PREFIX/share/apache2/default-site/htdocs
    git clone https://github.com/dhammagift/dg.git ./
    bash ./scripts/install-android.sh -s
    ```

1. If you want to add offline audio files, clone this repo to `./assets/audio`:

    ```bash
    mkdir -p $PREFIX/share/apache2/default-site/htdocs/assets/audio
    cd $PREFIX/share/apache2/default-site/htdocs/assets/audio
    git clone https://github.com/dhammagift/audio ./
    ```

### Option #2 - manual installation

#### For Android

1. Install Termux from [F-Droid](https://f-droid.org/packages/com.termux/) or [GitHub](https://github.com/termux/termux-app)

1. Open Termux and run:

    ```bash
    pkg install -y php-apache apache2 pv wget git iconv python w3m
    ```

1. Fix PHP configuration based on this [article](https://parzibyte.me/blog/en/2019/04/28/install-apache-php-7-android-termux/#Step_2_Install_Apache_and_PHP)

    ```bash
    nano /data/data/com.termux/files/usr/etc/apache2/httpd.conf
    ```

    Comment out and add the following lines:

    ```apache
    #LoadModule mpm_worker_module libexec/apache2/mod_mpm_worker.so
    LoadModule mpm_prefork_module libexec/apache2/mod_mpm_prefork.so

    LoadModule php_module /data/data/com.termux/files/usr/libexec/apache2/libphp.so
      <FilesMatch \.php$>
        SetHandler application/x-httpd-php
      </FilesMatch>

      <IfModule dir_module>
          DirectoryIndex index.php index.html index.htm
      </IfModule>

      LoadModule rewrite_module libexec/apache2/mod_rewrite.so
      ServerName localhost:8080
      ServerName 127.0.0.1:8080
    ```

    and, if needed:

    ```apache
    ServerName #yourip:8080
    ```

Now, download offline resources:

1. Go to the Apache directory:

    ```bash
    cd /data/data/com.termux/files/usr/share/apache2/default-site/htdocs
    ```

1. Clone this repo:

   ```bash
   git clone https://github.com/dhammagift/dg.git ./
   ````

1. Clone the current https://suttacentral.net data:

    ```bash
    git clone https://github.com/suttacentral/sc-data.git ./suttacentral.net
    ```

1. Download the https://accesstoinsight.org data:

    ```bash
    wget http://accesstoinsight.org/tech/download/ati.zip
    unzip ati.zip ./accesstoinsight.org
    ```

1. Download legacy https://suttacentral.net data: \
   (note: you dont need it if the https://suttacentral.net offline PWA is working fine on your phone)

    ```bash
    wget https://legacy.suttacentral.net/exports/sc-offline-2016-11-30_16:03:42.zip
    unzip sc-offline-2016-11-30_16:03:42.zip ./legacy.suttacentral.net
    ```

    or:

    ```bash
    wget https://legacy.suttacentral.net/exports/sc-offline-2016-11-30_16:03:42.7z
    ```

1. Download https://theravada.ru:

    ```bash
    mkdir theravada.ru && cd theravada.ru
    wget -r --no-check-certificate  --no-parent -P ./ https://theravada.ru/Teaching/canon.htm
    ```

    Fix possible double dir... check later

    ```bash
    cd theravada.ru/Teaching/Canon/Suttanta
    for i in `find . -name  "*" -type f`; do
    echo $i;
    iconv -f windows-1251 $i > ../tmp
    mv ../tmp $i
    sed -i 's@windows-1251@utf-8@g' $i
    done
    ```

1. Check and fix links if needed:

    ```bash
    cd /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/ru

    ln -s ../assets ./assets
    ln -s ../sc ./sc
    ln -s ../scripts ./scripts
    ln -s ../result ./result
    ```

1. (Optional) - if you downloaded https://suttacentral.net data somewhere else, not in the Apache default directory:

    ```bash
    cd /data/data/com.termux/files/usr/share/apache2/default-site/htdocs/
    rm suttacentral suttacentral.net
    ln -s ../yourpath ./suttacentral.net
    ln -s ../yourpath ./theravada.ru
    ln -s ../yourpath ./legacy.suttacentral.net
    ```

    Or, if you want to keep offline resources in other places without symlinks, edit paths in `./config/script_config.sh` and `./config/config.php`

For testing your queries via the CLI, you may run:

```bash
bash ./scripts/finddhamma.sh yourqueryInPali
bash ./scripts/finddhamma.sh -ru yourqueryInRussian
bash ./scripts/finddhamma.sh -en yourqueryInEnglish
bash ./scripts/finddhamma.sh -th yourqueryInThai
```

Before using dg offline, don't forget to run:

```bash
apachctl start
termux-open-url http://localhost:8080/
```

This should open http://localhost:8080 in your web browser.

#### For Windows?

Not yet available

#### For iOS?

Might be possible to run on IOS devices with
[phpwin](httpsp://apps.apple.com/us/app/phpwin/id1157634089) or similar
and some terminal emulator e.g. [from this article](https://alternativeto.net/software/termux/?platform=iphone)

never tried. please let me know if there is a way.
