# blockchain-developer-bootcamp-final-project

### Shopping Center Contract
Isoko is a blockchain application that will be used to buy and sell articles.

#### Features

* Users should be able to upload an article, give a discription and a unit price

* Users should be able to buy an article

* Users should be able to add articles on a wishlist

* The Seller should be able to delete the uploaded article

* The wishlist owner should be able to remove an article from the list

#### Tools and Technologies
This application is being build using React.js for the frontend and Ethereum and Solidity for writing smart contracts.
Articles pictures are stored on IPFS.

#### Run the Project Locally
* Clone this repo on your local machine using this command `git clone https://github.com/mifeille/blockchain-developer-bootcamp-final-project.git`
* Make sure you have Node.js and Truffle suite installed on your machine
* Make sure you have Metamask or any other cryptocurrency wallet you can use to test and connect it to localhost, port 7545
* Create a new workspace on Ganache and link it to this project config file
* Run `npm i` to install all the dependencies
* Migrate smart contracts using this command `truffle migrate`, if you are not running the migrations for the first time please use `truffle migrate --reset`
* To run tests, please use `truffle test`, this project currently have 6 tests
* To start the application please run `npm start`

#### Project Screencast

To watch the appplication screencast, Please click [here](https://www.loom.com/share/b33b0d3c055d440ca68d821fbd060f72)

To see the application, Please click [here](https://mifeille.github.io/blockchain-developer-bootcamp-final-project/)