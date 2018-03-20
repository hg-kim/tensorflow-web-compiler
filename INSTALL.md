# Install Python
ver.2.7.14 (if it on Windows, 64bit 3.6 available)

sudo apt-get update
sudo apt-get install -y python-pip python-dev
sudo pip install -U pip


# Install Tensorflow
https://www.tensorflow.org/install/install_linux

ver.1.5

sudo pip install -U tensorflow
sudo pip install -U tensorflow-serving-api
sudo pip install -U pandas


# Install MongoDB
https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

ver.3.6

sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2930ADAE8CAF5059EE73BB4B58712A2291FA4AD5
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.6 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-3.6.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start


# Install Node.js
https://nodejs.org/ko/download/package-manager/#debian-ubuntu-linux

ver.8.9.4 needed for Meteor 1.6.1

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs build-essential
sudo chown -R azureuser:$(id -gn azueruser) /home/azureuser/.config
sudo npm i -g pm2
sudo apt-get install -y authbind
sudo touch /etc/authbind/byport/80
sudo chown azureuser /etc/authbind/byport/80
sudo chmod 755 /etc/authbind/byport/80


# Install Meteor (for build within server)
curl https://install.meteor.com/ | sh


# Environments (add to ~/.profile & source ~/.profile)
export MONGO_URL="mongodb://127.0.0.1:27017/tensorflow-web"
export ROOT_URL="http://tensorflow-web.koreasouth.cloudapp.azure.com"
export BIND_IP="0.0.0.0"
export PORT="80"
+alias pm2='authbind --deep pm2'


# Start Server
mkdir ~/dist
git clone https://github.com/gninraw/tensorflow-web.git
cd tensorflow-web/
meteor npm install
meteor build ~/dist --architecture os.linux.x86_64
cd ~/dist
tar -zxvf tensorflow-web.tar.gz
npm install --prefix bundle/programs/server
pm2 update
pm2 start bundle/main.js --name tensorflow-web -i 0


