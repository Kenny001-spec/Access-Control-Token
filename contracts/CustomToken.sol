// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {AccessControl} from "./AccessControlToken.sol";

contract CustomToken is AccessControl {
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    string private _name;
    string private _symbol;
    uint8 private constant DECIMALS = 18;
    uint256 private _totalSupply;
    address public immutable OWNER;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    constructor(string memory tokenName, string memory tokenSymbol) {
        require(bytes(tokenName).length > 0, "Empty name");
        require(bytes(tokenSymbol).length > 0, "Empty symbol");
        
        _name = tokenName;
        _symbol = tokenSymbol;
        OWNER = msg.sender;
        
        _mintInitial(msg.sender);
    }

    function name() external view returns (string memory) {
        return _name;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function decimals() external pure returns (uint8) {
        return DECIMALS;
    }

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function allowance(address owner_, address spender) external view returns (uint256) {
        return _allowances[owner_][spender];
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }

    function mint(address to, uint256 amount) external onlyAuthorized {
        require(to != address(0), "Zero address mint");
        require(amount > 0, "Zero amount mint");

        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
    }

    function burn(address from, uint256 amount) external onlyAuthorized {
        require(from != address(0), "Zero address burn");
        require(_balances[from] >= amount, "Balance exceeded");
        
        unchecked {
            _balances[from] -= amount;
            _totalSupply -= amount;
        }
        
        emit Transfer(from, address(0), amount);
    }

    function _mintInitial(address account) private {
        uint256 initialSupply = 1_000_000 * 10**DECIMALS;
        _totalSupply = initialSupply;
        _balances[account] = initialSupply;
        
        emit Transfer(address(0), account, initialSupply);
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) private {
        require(from != address(0), "Zero address from");
        require(to != address(0), "Zero address to");
        
        uint256 fromBalance = _balances[from];
        require(fromBalance >= amount, "Balance exceeded");
        
        unchecked {
            _balances[from] = fromBalance - amount;
            _balances[to] += amount;
        }
        
        emit Transfer(from, to, amount);
    }

    function _approve(
        address owner_,
        address spender,
        uint256 amount
    ) private {
        require(owner_ != address(0), "Zero address owner");
        require(spender != address(0), "Zero address spender");
        
        _allowances[owner_][spender] = amount;
        emit Approval(owner_, spender, amount);
    }

    function _spendAllowance(
        address owner_,
        address spender,
        uint256 amount
    ) private {
        uint256 currentAllowance = _allowances[owner_][spender];
        
        if (currentAllowance != type(uint256).max) {
            require(currentAllowance >= amount, "Allowance exceeded");
            unchecked {
                _allowances[owner_][spender] = currentAllowance - amount;
            }
        }
    }
}