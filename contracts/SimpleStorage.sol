pragma solidity ^0.4.24;
//import "./TokenERC20.sol";

contract SimpleStorage {
    string storedData;  //used to store the hash data of the file
    //TokenERC20 token;   //used to store the token data of the system

    function upload(string x) public { //store the data in the contract
        storedData = x;
    }

    function download() public view returns (string) {   //get the data from the contract
        return storedData;
    }
}