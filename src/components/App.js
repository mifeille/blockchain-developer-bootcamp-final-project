import React, { Component } from 'react';
import Web3 from 'web3';
import './App.css';
import Navbar from './Navbar'
import Main from './Main'
import Isoko from '../abis/Isoko.json'
import IsokoDeployed from '../abis/Isoko.json'


// Connect to IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadData()
  }

  // Connect the front end app to the blockchain with web 3
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected!')
    }
  }

  async loadData() {
    const web3 = window.web3
    // Load account
    const accounts = await web3.eth.getAccounts()
    console.log(accounts[0])

    // update the state with the value
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    const networkData = Isoko.networks[networkId]
    const isokoNetworkData = IsokoDeployed.networks[networkId]

    // Connect to the smart contract
    if(networkData) {
      const isoko = web3.eth.Contract(Isoko.abi, networkData.address)
      const isokoDeployed = web3.eth.Contract(IsokoDeployed.abi, isokoNetworkData.address)
      const isokoAddress = IsokoDeployed.networks[networkId].address
      this.setState({ isoko })
      this.setState({ isokoAddress })
      this.setState({ isokoDeployed })
      const articlesCount = await isoko.methods.articleCount().call()
      const wishListCount = await isoko.methods.wishListCount().call()
      console.log(articlesCount)
      console.log(isokoAddress)
      console.log(this.state.isokoAddress)
      
      this.setState({ articlesCount })
      this.setState({ wishListCount })

      // Load wishlist
      for (var i = 1; i <= wishListCount; i++) {
        const wish = await isokoDeployed.methods.theWishList(i).call()
        if(wish.wishListOwner === this.state.account) {
          this.setState({
            wishList: [...this.state.wishList, wish]
          })
        } 
      }
      console.log(`wishlist" ${wishListCount}`)

      // Load images
      for (var j = 1; j <= articlesCount; j++) {
        console.log('hello')
        const article = await isokoDeployed.methods.articles(j).call()
        console.log('hello1')
        this.setState({
          articles: [...this.state.articles, article]
        })
      }
      this.setState({ loading: false})
    } else {
      window.alert('Isoko contract not deployed to this network.')
    }
  }

  // convert to array buffer so that it can be uploaded to IPFS
  convertFile = event => {

    event.preventDefault()
    const file = event.target.files[0]
    const reader = new window.FileReader()
    reader.readAsArrayBuffer(file)

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) })
      console.log('buffer', this.state.buffer)
    }
  }

  uploadArticleImage = (description, price) => {
    console.log("Sending converted file to ipfs...")

    //adding file to the IPFS
    ipfs.add(this.state.buffer, (error, result) => {
      console.log('Ipfs result', result)
      if(error) {
        console.error(error)
        return
      }

      this.setState({ loading: true })
      this.state.isoko.methods.createArticle(result[0].hash, description, price).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
      })
    })
  }

  createArticle (hash, description, price) {
      this.setState({ loading: true })
      console.log(`account owner ${this.state.account}`)
      console.log(`contract address ${this.state.isokoAddress}`)
      this.state.isokoInterface.methods.articleCreation(this.state.isokoAddress, hash, description, price).send({ from: this.state.account }).once('receipt', (receipt) => {
        this.setState({ loading: false })
      })
      
  }

  purchaseArticle(id, price) {
    this.setState({ loading: true })
    console.log(id)
    console.log(price)
    console.log(this.state.isokoAddress)
    console.log(`user acc :${this.state.account}`)
    this.state.isoko.methods.purchaseArticle(id).send({ from: this.state.account, value: price}).once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  removeArticle(id) {
    this.setState({ loading: true })
    console.log(`remove id ${id}`)
    this.state.isoko.methods.removeArticle(id).send({ from: this.state.account}).once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  addToWishList(id) {
    this.setState({ loading: true })
    console.log(`wish list id ${id}`)
    this.state.isoko.methods.addToWishList(id).send({ from: this.state.account}).once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  removeFromWishList(id) {
    this.setState({ loading: true })
    this.state.isoko.methods.removeFromWishList(id).send({ from: this.state.account}).once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  refreshPage() {
    window.location.reload(false);
  }
  constructor(props) {
    super(props)
    this.state = {
      account: '',
      isoko: null,
      articles: [],
      loading: true,
      isokoAddress: null,
      isokoDeployed: null,
      wishList: []
    }

    this.convertFile = this.convertFile.bind(this)
    this.uploadArticleImage = this.uploadArticleImage.bind(this)
    this.createArticle = this.createArticle.bind(this)
    this.purchaseArticle = this.purchaseArticle.bind(this)
    this.removeArticle = this.removeArticle.bind(this)
    this.addToWishList = this.addToWishList.bind(this)
    this.refreshPage = this.refreshPage.bind(this)
    this.removeFromWishList = this.removeFromWishList.bind(this)
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        { this.state.loading
          ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
          : <Main
              articles = {this.state.articles}
              convertFile = {this.convertFile}
              uploadArticleImage = {this.uploadArticleImage}
              purchaseArticle = {this.purchaseArticle}
              createArticle = {this.createArticle}
              removeArticle = {this.removeArticle}
              addToWishList = {this.addToWishList}
              wishList = {this.state.wishList}
              account = {this.state.account}
              removeFromWishList = {this.removeFromWishList}
            />
          }
      </div>
    );
  }
}

export default App;