### WHEN $PREFIX IS UNDEFINED
if ! [ $PREFIX ] 
then
    PREFIX='/usr'
fi
### WHEN $TMPDIR IS UNDEFINED
if ! [ $TMPDIR ]
then
    TMPDIR='/tmp'
fi

#for PROOT users
if ! [ -e "/usr/bin/sudo" ]
then
    if ! [ $UID == "0" ] 
    then
        echo "go to root to install sudo, and bash install.sh again"
        else
          apt install sudo
    fi
fi

###WELCOME
TEXT_WELCOME_UP="DXTSTD-Bot"
TEXT_WELCOME_DOWN="Installer"
if [ -e "${PREFIX}/bin/figlet" ]
then
    figlet -c $TEXT_WELCOME_UP \ $TEXT_WELCOME_DOWN
else 
    echo "\"$TEXT_WELCOME_UP $TEXT_WELCOME_DOWN\""
    echo
fi

### Package
PACKAGE_ANDROID="nodejs wget curl git ffmpeg sox imagemagick";
PACKAGE_LINUX="libreoffice wget curl git ffmpeg sox imagemagick gnome-screenshot xvfb"
PACKAGES_ANDROID=(
    wget curl git ffmpeg sox magick
)
PACKAGES_LINUX=(
    libreoffice wget curl git ffmpeg sox convert Xvfb "gnome-screenshot"
)

DEVICE_OS=$(uname -o)
DEVICE_ARCH=$(uname -m)
echo "Detected OS: ${DEVICE_OS}"
echo "Detected Arch: ${DEVICE_ARCH}"
echo ""

echo "Require Package: "
if [ $DEVICE_OS == 'GNU/Linux' ]
then
    for PACKAGE in "${PACKAGES_LINUX[@]}"
    do
        EXISTS='No'
        if [ -e $PREFIX/bin/$PACKAGE ]
        then
            EXISTS='Yes'
        fi
        echo "> \"${PACKAGE}\" exists: ${EXISTS}"
    done
fi
if [ $DEVICE_OS == 'Android' ]
then
    for PACKAGE in "${PACKAGES_ANDROID[@]}"
    do
    EXISTS='No'
        if [ -e $PREFIX/bin/$PACKAGE ]
        then
            EXISTS='Yes'
        fi
        echo "> \"${PACKAGE}\" exists: ${EXISTS}"
    done
fi
echo

NODEJS_EXISTS="NO"
if [ -e "${PREFIX}/bin/node" ]
then
    NODEJS_EXISTS="YES"
    NODEJS_EXISTS+=" ($(node --version))"
fi

echo "NodeJS Exists: ${NODEJS_EXISTS}"

### For Package Manager
PACKAGE_MANAGER=""
detect_package_manager() {
    APT="${PREFIX}/bin/apt"
    DNF="${PREFIX}/bin/dnf"
    if [ -e $APT ]
    then
        PACKAGE_MANAGER="APT"
        else if [ -e $DNF ]
        then
            PACKAGE_MANAGER="DNF"
        fi
    fi;
    
    echo "Detected Package Manager: $PACKAGE_MANAGER"
}

## For NodeJS
URL_NODEJS=""
NODEJS_LINUX() {
    NODEJS_WEB="https://nodejs.org/dist"
    NODEJS_VERSION="v18.3.0"
    NODEJS_ARCH="x64"
    NODEJS_PLATFORM="linux"

    if { [ $DEVICE_ARCH == 'amd64' ] || [ $DEVICE_ARCH == 'x86_64' ]; }
    then
        NODEJS_ARCH='x64'
        else if { [ $DEVICE_ARCH == 'aarch64' ]; }
        then
            NODEJS_ARCH='arm64'
            else if { [ $DEVICE_ARCH == 'aarch32' ] || [ $DEVICE_ARCH == 'armv8l' ] || [ $DEVICE_ARCH == 'armv7l' ]; }
            then
                NODEJS_ARCH='armv7l'
            fi
        fi
    fi
    NODEJS_PACKAGE="node-${NODEJS_VERSION}-${NODEJS_PLATFORM}-${NODEJS_ARCH}.tar.gz"
    URL_NODEJS="${NODEJS_WEB}/${NODEJS_VERSION}/${NODEJS_PACKAGE}"
}

### EXECUTE
ask_install_package() {
    read -p "Install Requirement Package? [Y/n]: " ANSWER
    case "$ANSWER" in
        [yY][eE][sS]|[yY])
        detect_package_manager;
        echo
        ANSWER="Y"
    ;;
        *)
        ANSWER="N"
    ;;
    esac
    
    if [ $ANSWER == "Y" ]
    then
        if [ $DEVICE_OS == "GNU/Linux" ]
        then
            if [ $PACKAGE_MANAGER == "APT" ]
            then
                sudo apt update
                sudo apt upgrade
                sudo apt install $PACKAGE_LINUX
                else if [ $PACKAGE_MANAGER == "DNF" ] 
                then
                    sudo dnf check-update
                    sudo dnf upgrade
                    sudo dnf install "${PACKAGE_LINUX}"
                fi
            fi
            else if [ $DEVICE_OS == "Android" ]
            then
                apt update
                apt upgrade
                apt install $PACKAGE_ANDROID
            fi
        fi
    fi
}
ask_install_package;


ask_install_nodejs() {
    if [ $DEVICE_OS == "GNU/Linux" ]
    then
        read -p "Install/Upgrade NodeJS? [Y/n]: " ANSWER_INSTALL
        case "$ANSWER_INSTALL" in
            [yY][eE][sS]|[yY])
            NODEJS_LINUX
            echo "URL NodeJS: ${URL_NODEJS}"
            echo
            ANSWER_INSTALL="Y"
        ;;
            *)
            ANSWER_INSTALL="N"
            return
        ;;
        esac
        
        read -p "Install NodeJS Automatic? [Y/n]: " ANSWER_AUTOMATIC
        case "$ANSWER_AUTOMATIC" in
            [yY][eE][sS]|[yY])
            NODEJS_LINUX
            echo "URL NodeJS: ${URL_NODEJS}"
            echo
            ANSWER_AUTOMATIC="Y"
        ;;
            *)
            ANSWER_AUTOMATIC="N"
        ;;
        esac;
        
        
        if [ $ANSWER_AUTOMATIC == 'Y' ]
        then
            echo 'Downloading NodeJS...'
            wget -O $TMP/nodejs.tar.gz $URL_NODEJS 
            echo 'Extract NodeJS...'
            mkdir $TMP/nodejs
            tar xfvz $TMP/nodejs.tar.gz -C $TMP/nodejs
            echo "Move File To $PREFIX (access super user require)..."
            sudo cp -rf $TMP/nodejs/*/* $PREFIX
            echo "Remove TMP NodeJS..."
            rm -rf $TMP/node*
        fi
    fi
}
ask_install_nodejs

ask_install_npm() {
    read -p "Install NPM Package? [Y/n]: " ANSWER
    case "$ANSWER" in
        [yY][eE][sS]|[yY])
        echo
        ANSWER="Y"
    ;;
        *)
        ANSWER="N"
    ;;
    esac

    NPM_PACKAGE="typescript ts-node nodemon yarn"
    if [ $ANSWER == 'Y' ]
    then
        rm package-lock.json
        rm yarn.lock
        if [ $DEVICE_OS == "GNU/Linux" ] 
        then
            echo "Installing Package NPM Global: $NPM_PACKAGE..."
            sudo npm install $NPM_PACKAGE -g
            echo "Installing Package For This Bot..."
            npm install --no-bin-links
            else if [ $DEVICE_OS == "Android" ]
            then
                echo "Installing Package NPM Global: $NPM_PACKAGE..."
                npm install $NPM_PACKAGE -g
                echo "Installing Package NPM For This Bot..."
                npm install --no-bin-links
            fi
        fi

#        echo "Build @adiwajshing/baileys"
#        cd node_modules/@adiwajshing/baileys
#        echo "tsc build"
#        tsc
#        cd ../../..
    fi
}
ask_install_npm

echo
echo "Start Script with ts-node"
echo "\"ts-node .\""
