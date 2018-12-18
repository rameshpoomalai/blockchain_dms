docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
rm -rf ~/.composer
cd ~/fabric-dev-servers/
export FABRIC_VERSION=hlfv11
./startFabric.sh
./createPeerAdminCard.sh
cd ../git/Blockchain_credit/contracts/
npm install
composer network install --card PeerAdmin@hlfv1 --archiveFile dms-network@0.0.1.bna
composer network start --networkName dms-network --networkVersion 0.0.1 --networkAdmin admin --networkAdminEnrollSecret adminpw --card PeerAdmin@hlfv1 --file networkadmin.card
composer card import --file networkadmin.card
composer network ping --card admin@dms-network
cd ../web-app
npm install
npm start
