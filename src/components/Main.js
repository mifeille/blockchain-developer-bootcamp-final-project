import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Main extends Component {

  render() {
    return (
      <div className="container-fluid mt-5">
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;</p>
              <h3>Upload Article</h3>
              <form onSubmit={(event) => {
                event.preventDefault()
                const description = this.articleDescription.value
                const price = window.web3.utils.toWei(this.articlePrice.value.toString(), 'Ether')
                this.props.uploadArticleImage(description, price)
                // this.props.createArticle(description, price)
              }} >
                <input type='file' accept=".jpg, .jpeg, .png, .bmp, .gif" onChange={this.props.convertFile} />
                  <div className="form-group mr-sm-2">
                    <br></br>
                      <input
                        id="articleDescription"
                        type="text"
                        ref={(input) => { this.articleDescription = input }}
                        className="form-control"
                        placeholder="Article description..."
                        required />
                    <input
                        id="articlePrice"
                        type="text"
                        ref={(input) => { this.articlePrice = input }}
                        className="form-control"
                        placeholder="Article Price..."
                        required />
                  </div>
                <button type="submit" className="btn btn-primary btn-block btn-lg">Upload!</button>
              </form>
              <p>&nbsp;</p>
              { (this.props.wishList.length !== 0)
              ? <h4>WishList</h4>
              : null}
              
              { this.props.wishList.map((wish, key) => {
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(wish.article.owner, 30).toString()}`}
                      />
                      <small className="text-muted">{wish.article.owner}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${wish.article.imageHash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{wish.article.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <p className="float-left mt-1 text-muted">
                          Price: {window.web3.utils.fromWei(wish.article.unitPrice.toString(), 'Ether')} ETH
                        </p>
                        <button
                          className="btn btn-link btn-sm float-right pt-1"
                          name={wish.article.id}
                          value={wish.article.unitPrice}
                          onClick={(event) => {
                            console.log(`owner ${wish.article.owner}`)
                            this.props.purchaseArticle(event.target.name, event.target.value)
                          }}
                        >
                          Buy
                        </button>
                      </li>
                      <li className="list-group-item py-2">
                      <button
                          className="btn btn-link btn-sm float-left pt-1"
                          name={wish.article.id}
                          value={wish.article.unitPrice}
                          onClick={(event) => {
                            this.props.removeFromWishList(event.target.name)
                          }}
                        >
                          Remove From WishList
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
              { (this.props.articles.length !== 0)
              ?<h4>Articles</h4>
              : null}

              { this.props.articles.map((article, key) => {
                var isSellerOrSoldOut = false;
                if(article.owner === this.props.account || article.sooldOut) {
                  isSellerOrSoldOut = true
                }
                return(
                  <div className="card mb-4" key={key} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        src={`data:image/png;base64,${new Identicon(article.owner, 30).toString()}`}
                      />
                      <small className="text-muted">{article.owner}</small>
                    </div>
                    <ul id="imageList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p className="text-center"><img src={`https://ipfs.infura.io/ipfs/${article.imageHash}`} style={{ maxWidth: '420px'}}/></p>
                        <p>{article.description}</p>
                      </li>
                      <li key={key} className="list-group-item py-2">
                        <p className="float-left mt-1 text-muted">
                          Price: {window.web3.utils.fromWei(article.unitPrice.toString(), 'Ether')} ETH
                        </p>
                       
                        {(!isSellerOrSoldOut)
                          ?<button
                            className="btn btn-link btn-sm float-right pt-1"
                            name={article.id}
                            value={article.unitPrice}
                            onClick={(event) => {
                              this.props.purchaseArticle(event.target.name, event.target.value)
                            }}
                          >
                            Buy
                          </button>
                          : null
                          }
                      </li>
                      <li className="list-group-item py-2">
                      { (article.owner !== this.props.account)
                        ?<button
                            className="btn btn-link btn-sm float-left pt-1"
                            name={article.id}
                            value={article.unitPrice}
                            onClick={(event) => {
                              this.props.addToWishList(event.target.name)
                            }}
                          >
                            Add To WishList
                          </button>
                          : null
                        }
                         
                        { (article.owner === this.props.account)
                        ?<button
                          className="btn btn-link btn-sm float-right pt-1"
                          name={article.id}
                          onClick={(event) => {
                            this.props.removeArticle(event.target.name)
                          }}
                        >
                          Remove Article
                        </button>
                        : null
                        }
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}
export default Main;