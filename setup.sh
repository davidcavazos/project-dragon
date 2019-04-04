
sudo cp mysystemd.service /etc/systemd/system/mysystemd.service

sudo systemctl daemon-reload
sudo systemctl enable mysystemd.service
sudo systemctl start mysystemd.service
