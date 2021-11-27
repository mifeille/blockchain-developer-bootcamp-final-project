### Security Measures
* I used modifers only for validations, for example to make sure the user who wants to buy the article does not have enough ether
* I used a this specific compiler Pragma, 0.8.7 which means that it has been tested with this specific version,
    if this version is changed it might expose the contract to some attacks.
* I used require to make some validations, like to make sure that the owner of the article is the only one who can delete the article.
