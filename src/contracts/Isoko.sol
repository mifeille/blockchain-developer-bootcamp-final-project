// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";


/// @notice this library can be used on any string to check if a string is a substring of another
library String {
    function searchSubString(string memory searchableText, string memory searchText) pure internal returns(bool) {
        // Convert String to bytes
        bytes memory searchableTextInBytes = bytes(searchableText);
        bytes memory searchTextInBytes = bytes(searchText);
        // the string and substring should not be empty
        require(searchableTextInBytes.length > 0, "The String text should not be empty");
        require(searchTextInBytes.length > 0, "The SubString text should not be empty");
        // Search if a specific string contains a substring
        bool found = false;
        for (uint i = 0; i < searchableTextInBytes.length - searchTextInBytes.length; i++) {
            bool flag = true;
            for (uint j = 0; j < searchTextInBytes.length; j++)
                if (searchableTextInBytes [i + j] != searchTextInBytes [j]) {
                    flag = false;
                    break;
                }
                if (flag) {
                    found = true;
                    break;
                }
            }

        return found;
        
    }
} 

/// @title Isoko which mean marketpalce in kinyarwanda
/// @notice this contract contains some basic marketplace functionalities
contract Isoko is Initializable {
    using String for string;

    /* State variables
    */
    uint public articleCount = 0;
    uint public wishListCount = 0;
    mapping(uint => Article) public articles;

    mapping(uint => WishList) public theWishList;

    mapping(uint => Article) public articlesFound;

    address payable public owner;

     constructor() {
        // Set the transaction sender as the owner of the contract.
        owner = payable(msg.sender);
    }

    // Modifier to check that the caller is the owner of
    // the contract.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        // Underscore is a special character only used inside
        // a function modifier and it tells Solidity to
        // execute the rest of the code.
        _;
    }

    struct Article {
        uint id;
        string imageHash; // location in IPFS
        string description;
        uint unitPrice;
        uint quantity;
        address payable owner;
        uint quantitySold;
        bool soldOut;
    }

    struct WishList {
        uint id;
        Article article;
        address payable wishListOwner;
    }

    event ArticleCreated(
        uint id,
        string imageHash,
        string description,
        uint unitPrice,
        address payable owner,
        uint quantitySold,
        bool soldOut
    );

    /* Events
    */
    event ArticlePurchased(
        uint id,
        string imageHash,
        string description,
        uint unitPrice,
        address payable owner,
        uint quantitySold,
        bool soldOut
    );

     event AddedToWishList(
        uint id,
        Article article,
        address payable wishListOwner
    );

     event ArticleDeleted(
        Article article
    );

    event ViewedWishList(
        WishList[] myWishList
        );

    event RemovedFromWishList(
        WishList wish
    );

    /* Modifiers
    */

    /// @notice To check if the right amount is sent
    /// @param _id the unit price of the article(which will be multiplied with the quantity the user want to buy)
    modifier paidTheRightAmount(uint _id) {
        // Fetch article
        Article memory _article = articles[_id];
        require(msg.value >= _article.unitPrice, "Invalid Amount");
        _;

    }

    /* Functions
    */

    /// @notice Create an article
    /// @param _imageHash the image hash on IPFS
    /// @param _description the article description
    /// @param _unitPrice the unit price - for later we will be taking the article quantity in stock
    function createArticle(string memory _imageHash, string memory _description, uint _unitPrice) public {
        // Validate the body request
        // The article description should not be empty
        require(bytes(_description).length > 0, "The Article Description should not be empty!");
        // The image hash should be present
        require(bytes(_imageHash).length > 0, "The image hash should be present!");
        // The article  unit price should not be less than 0
        require(_unitPrice > 0, "The article unit price should not be less than 0!");
        // Increment aricle count
        articleCount ++;
        // Create the article
        articles[articleCount] = Article(articleCount, _imageHash, _description, _unitPrice, 1, payable(msg.sender), 0, false);
        // Trigger an event that an article has been created
        emit ArticleCreated(articleCount, _imageHash, _description, _unitPrice, payable(msg.sender), 0, false);
    }

    /// @notice Purchase an article
    /// @param _id the article Id
    function purchaseArticle(uint _id) external payable paidTheRightAmount(_id) {
        // Make sure the article has a valid id
        require(_id > 0 && _id <= articleCount, "The Id is not valid!");
        // Fetch the article
        Article memory _article = articles[_id];
        // Fetch the owner
        address payable _seller = _article.owner;
        // // Require that there is enough Ether in the transaction
        // require(msg.value >= (_article.unitPrice));
         // Require that article is not soldOut
        require(!_article.soldOut);
        // Require that the buyer is not the seller
        require(_seller != msg.sender);
        // Transfer ownership to the buyer and update quantity
        _article.owner = payable(msg.sender);
        // for future use when users will be aloowed to add quantity to the article uploaded
        _article.quantitySold = _article.quantitySold + 1;
        // Mark as sold out if the quantity is equal to 0
        _article.soldOut = true;
        // Update the product
        articles[_id] = _article;
        // Pay the seller by sending them Ether
        (_seller).transfer(msg.value);
        // Trigger an event that an article has been sold
        emit ArticlePurchased(articleCount, _article.imageHash, _article.description, _article.unitPrice, payable(msg.sender), _article.quantitySold, _article.soldOut);
    }

     /// @notice Remove an article
    /// @param _id the article Id
    function removeArticle(uint _id) public {
        // Fetch the article
        Article memory _article = articles[_id];
        // Make sure that the person who wants to remove the article is the owner
        require(msg.sender == _article.owner, "Not The Article Owner");
        // Delete the article
        for (uint i = _id; i< articleCount - 1; i++){
            articles[i] = articles[i+1];
        }
        delete articles[articleCount - 1];
        articleCount--;

        // Trigger an event that an article has been deleted
        emit ArticleDeleted(_article);
    }

    /// @notice Add an article to a wishlist
    /// @param _id the article Id
    function addToWishList(uint _id) public {
        // Fetch the article
        Article memory _article = articles[_id];
        // Make sure that the person who wants to add the article to the wishlist is not the owner
        require(_article.owner != msg.sender, "You are the Article Owner");
        // Increment aricle count
        wishListCount ++;
        // Add the article to the wishlist
        theWishList[wishListCount] = WishList(wishListCount, _article, payable(msg.sender));
        // Trigger an event that an article has been added to the wishlist
        emit AddedToWishList(wishListCount, _article, payable(msg.sender));

    }

    /// @notice Remove an article to a wishlist
    /// @param _id the article Id
    function removeFromWishList(uint _id) public {
        // Fetch the article
        WishList memory _wish = theWishList[_id];
        // Make sure that the person who wants to remove the article from the wishlist is the owner
        require(msg.sender == _wish.wishListOwner, "Not The Wishlist Owner");
        // Remove the article from the wishlist
        for (uint i = _id; i< wishListCount - 1; i++){
            theWishList[i] = theWishList[i+1];
        }
        delete theWishList[wishListCount - 1];
        wishListCount--;
        // Trigger an event that an article has been removed from the wishlist
        emit RemovedFromWishList(_wish);
    }

    /// @notice search for a specific article
    /// @param _textToSearch the text to search for
    function search(string memory _textToSearch) view public returns (bool){
        // Find the article
        bool found = false;
        for(uint i = 1; i < articleCount; i++) {
            string memory searchT = articles[i].description;
            found = searchT.searchSubString(_textToSearch); 
            }
            return found;
    }
}