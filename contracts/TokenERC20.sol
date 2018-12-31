pragma solidity ^0.4.24;

contract TokenERC20 {
    string public constant name = "IPFS Coin";  // The name of the token
    string public constant symbol = "IPFS";     // The symbol of the token
    uint8 public constant decimals = 18;        // The number of decimals of the token
    uint256 public totalSupply = 10 * (10 ** uint256(decimals));                 // The total supply amount
    
    mapping(address=>uint256) private balances;
    mapping(address=>mapping(address=>uint256)) private allowances;
    
    event TransferEvent(address indexed _from, address indexed _to, uint256 _value);
    event ApprovalEvent(address indexed _owner, address indexed _spender, uint256 _value);

    function TockenERC20(){
        balances[msg.sender] = totalSupply;
    }

    function totalSupply() public constant returns (uint _totalSupply){
        _totalSupply = totalSupply;
    }  //return the total supply of the token

    function balanceOf(address tokenOwner) public constant returns (uint balance){
        balance = balances[tokenOwner];
    }  //return the balance of an address

    function allowance(address tokenOwner, address spender) public constant returns (uint remaining){
        remaining = allowances[tokenOwner][spender];
    }   //return the amount availabe

    function transfer(address to, uint value) public returns (bool success){
        require(balances[msg.sender] >= value);
        balances[msg.sender] -= value;
        balances[to] += value;
        TransferEvent(msg.sender,to,value);
        success = true;
    }   //transfer one's token to others

    function approve(address spender, uint value) public returns (bool success){
        allowances[msg.sender][spender] = value;
        ApprovalEvent(msg.sender,spender,value);
        success = true;
    }   //approve a spender to use the token

    function transferFrom(address from, address to, uint value) public returns (bool success){
        require(balances[from] >= value);
        require(allowances[from][msg.sender] >= value);
        balances[from] -= value;
        allowances[from][msg.sender] -= value;
        balances[to] += value;
        TransferEvent(from, to, value);
        success = true;
    } //execute transfer after approve()
}
