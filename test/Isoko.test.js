const Isoko = artifacts.require('./Isoko.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Isoko', ([deployer, seller, buyer]) => {
  let isoko

  before(async () => {
    isoko = await Isoko.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await isoko.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

  describe('articles', async () => {
    let result, wishListResult, articleCount

    before(async () => {
      result = await isoko.createArticle('aaaaaaa', 'iPhone X', web3.utils.toWei('1', 'Ether'), { from: seller })
      articleCount = await isoko.articleCount()

      wishListResult = await isoko.addToWishList(articleCount, { from: buyer })
      wishListCount = await isoko.wishListCount()
    })

    it('creates articles', async () => {
      // SUCCESS
      assert.equal(articleCount, 1)
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), articleCount.toNumber(), 'id is correct')
      assert.equal(event.description, 'iPhone X', 'description is correct')
      assert.equal(event.unitPrice, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, seller, 'owner is correct')
      assert.equal(event.soldOut, false, 'soldOut is correct')

      // FAILURE: Article must have a hash
      await isoko.createArticle('', 'iPhone x', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Article must have a description
      await isoko.createArticle('aaaaaaa', '', web3.utils.toWei('1', 'Ether'), { from: seller }).should.be.rejected;
      // FAILURE: Article should have a price greater than 0
      await isoko.createArticle('aaaaaaa', 'iphone X', 0, { from: seller }).should.be.rejected;
    })

    it('lists articles', async () => {
      const article = await isoko.articles(articleCount)
      assert.equal(article.id.toNumber(), articleCount.toNumber(), 'id is correct')
      assert.equal(article.description, 'iPhone X', 'description is correct')
      assert.equal(article.unitPrice, '1000000000000000000', 'price is correct')
      assert.equal(article.owner, seller, 'owner is correct')
      assert.equal(article.soldOut, false, 'soldOut is correct')
    })

    it('sells articles', async () => {
      // Track the seller balance before purchase
      let oldSellerBalance
      oldSellerBalance = await web3.eth.getBalance(seller)
      oldSellerBalance = new web3.utils.BN(oldSellerBalance)

      // SUCCESS: Buyer makes purchase
      result = await isoko.purchaseArticle(articleCount, { from: buyer, value: web3.utils.toWei('1', 'Ether')})

      // Check logs
      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), articleCount.toNumber(), 'id is correct')
      assert.equal(event.description, 'iPhone X', 'description is correct')
      assert.equal(event.unitPrice, '1000000000000000000', 'price is correct')
      assert.equal(event.owner, buyer, 'owner is correct')
      assert.equal(event.soldOut, true, 'soldOut is correct')

      // Check that seller received funds
      let newSellerBalance
      newSellerBalance = await web3.eth.getBalance(seller)
      newSellerBalance = new web3.utils.BN(newSellerBalance)

      let price
      price = web3.utils.toWei('1', 'Ether')
      price = new web3.utils.BN(price)

      const exepectedBalance = oldSellerBalance.add(price)

      assert.equal(newSellerBalance.toString(), exepectedBalance.toString())

    //   // FAILURE: Tries to buy a article that does not exist, i.e., article must have valid id
      await isoko.purchaseArticle(99, { from: buyer, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;   
      // FAILURE: Buyer tries to buy without enough ether
      await isoko.purchaseArticle(articleCount, { from: buyer, value: web3.utils.toWei('0.5', 'Ether') }).should.be.rejected;
      // FAILURE: Deployer tries to buy the article, i.e., article can't be purchased twice
      await isoko.purchaseArticle(articleCount, { from: deployer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
      // FAILURE: Buyer tries to buy again, i.e., buyer can't be the seller
      await isoko.purchaseArticle(articleCount, { from: buyer, value: web3.utils.toWei('1', 'Ether') }).should.be.rejected;
    })

    it('adds articles to wishlist', async () => {
        // SUCCESS
        assert.equal(wishListCount, 1)
        const event = result.logs[0].args
        assert.equal(event.id.toNumber(), wishListCount.toNumber(), 'id is correct')
        assert.equal(event.description, 'iPhone X', 'description is correct')
        assert.equal(event.unitPrice, '1000000000000000000', 'price is correct')
        assert.equal(event.owner, buyer, 'owner is correct')
  
        // FAILURE: the owner can not add his article to the wishlist
        await isoko.addToWishList(wishListCount, { from: buyer }).should.be.rejected;
      })
      
      it('deletes articles', async () => {
        result = await isoko.createArticle('aaaaaaa', 'iPhone 12', web3.utils.toWei('1', 'Ether'), { from: seller })
        articleCount = await isoko.articleCount()
        const articleCountBeforeDeletion = articleCount
        result = await isoko.removeArticle(articleCount, { from: seller })
        articleCount = await isoko.articleCount()
        // SUCCESS
        assert.equal(articleCount, articleCountBeforeDeletion - 1)

        // FAILURE: only the owner of the article can delete it
        await isoko.removeArticle(articleCount, { from: deployer }).should.be.rejected;
      }) 
    })
})
})
