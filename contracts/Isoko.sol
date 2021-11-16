// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract Isoko {
    uint public articleCount = 0;
    mapping(uint => Article) public articles;

    struct Article {
        uint id;
        string description;
        uint price;
        uint quantity;
        address payable owner;
        bool soldOut;
    }

    function createArticle() public {

    }

    function purchaseArticle(uint _id) public payable {
    }
}