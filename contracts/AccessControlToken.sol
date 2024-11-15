// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract AccessControl {
    address private _admin;
    mapping(address => bool) private _authorized;
    
    event AdminChanged(address indexed previousAdmin, address indexed newAdmin);
    event AuthorizationChanged(address indexed account, bool status);
    
    modifier onlyAdmin() {
        require(msg.sender == _admin, "Not admin");
        _;
    }
    
    modifier onlyAuthorized() {
        require(_authorized[msg.sender] || msg.sender == _admin, "Not authorized");
        _;
    }
    
    constructor() {
        _admin = msg.sender;
        _authorized[msg.sender] = true;
        emit AdminChanged(address(0), msg.sender);
    }
    
    function setAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit AdminChanged(_admin, newAdmin);
        _admin = newAdmin;
    }
    
    function authorize(address account) external onlyAdmin {
        _authorized[account] = true;
        emit AuthorizationChanged(account, true);
    }
    
    function deauthorize(address account) external onlyAdmin {
        _authorized[account] = false;
        emit AuthorizationChanged(account, false);
    }
}

