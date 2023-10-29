#!/bin/bash
sudo apt update
sudo apt install -y nodejs npm
#sudo ln -s /usr/bin/nodejs /usr/bin/node

cd /home/ubuntu
git clone https://github.com/Isracoder/gsg-hackathon.git

cd gsg-hackathon
sudo npm install express

sudo mv app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable app.service

npm install aws-sdk

#sudo systemctl start app.service

sudo reboot