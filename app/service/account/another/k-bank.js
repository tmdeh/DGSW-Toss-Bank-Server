const request = require('request')
const accountList = require('../../../DAL/AccountList');
const accountSql = require('../../../DAL/AccountSql');

exports.getAccountInfo = (phoneNumber) => {
    const url = 'http://10.80.161.192:8000/api/open/accounts/' + phoneNumber;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({msg : "KB 은행 불러오기 실패", data : []});
            return;
        }, 3000);
        request.get(url, (err, res, body) => {
            if(body == undefined) {
                resolve({msg : "KB 은행 불러오기 실패", data : []});
                return;
            }
            body = JSON.parse(body);
            if(err || body == undefined || body == []) {
                resolve({msg : "KB 은행 불러오기 실패", data : []});
                return;
            }
            if(body.msg == '계좌가 없습니다') {
                resolve({msg : "KB 은행 계좌가 없습니다.", data: []});
                return;
            }
            let tmp = [];
            // console.log(body);
            for(let i =0; i < body.accounts.length; i++) {
                if(!body.accounts[i].account_nickname.Valid) {
                    tmp.push({
                        bankName : "K-Bank",
                        accountName : "KB 통장",
                        accountNumber : body.accounts[i].id,
                        money : body.accounts[i].balance,
                        password : body.accounts[i].password
                    })
                }
                else {
                    tmp.push({
                        bankName : "K-Bank",
                        accountName : body.accounts[i].account_nickname.String,
                        accountNumber : body.accounts[i].id,
                        money : body.accounts[i].balance,
                        password : body.accounts[i].password
                    })
                }
            }
            // console.log(tmp);
            resolve({msg : "OK", data : tmp});
        })
    })
}

exports.accountExistCheck = async(accountNumber) => {
    const url = 'http://10.80.161.192:8000/api/open/accounts?account_id=' + accountNumber;
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({msg : "KB 은행 불러오기 실패", data : []});
            return;
        }, 3000);
        request.get(url, (err, res, body) => {
            if(body === undefined) {
                resolve({msg : "KB 은행 불러오기 실패", data : []});
                return;
            }
            body = JSON.parse(body);
            if(body.account_id == accountNumber) {
                resolve({msg : "OK", status:200});
                return;
            } 
            else if(body.msg == '해당하는 계좌가 없습니다') {
                resolve({msg : "존재하지 않는 계좌", status:400})
                return;
            }
        })
    })
}

exports.getConfirmedAccounts = async(userId, phoneNumber) => {
    let accounts = await this.getAccountInfo(phoneNumber);
    if(accounts.data.length == 0) {
        console.log(accounts.msg);
        return accounts.data;
    }
    let result = await accountList.getAccount(userId);
    let tmp = [];

    for(i of result) {
        for(j of accounts.data) {
            if(i.account === Number(j.accountNumber)) {
                tmp.push(j)
            }
        }
    }
    return tmp;
};


exports.send = async(send, receive, money) => {
    const name = await accountSql.getAccountUserName(send);
    const option = {
        uri : "10.80.161.192:8000/api/banking/deposit",
        method : 'POST',
        body : {
            sender : {
                bank_id : 666,
                account_id : send,
                name : name
            },
            receiver : {
                account_id : receive
            },
            amount : money
        },
        json : true,
    }
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            reject({msg : "k-Bank 은행 불러오기 실패", status:400});
            return;
        }, 3000);

        request.patch(option, (err, res, body) => {
            // console.log(body);
            if(body == undefined) {
                reject({msg : "k-Bank 은행 불러오기 실패", status:400});
            }
            if(body.status == 200) {
                resolve({msg : "OK", status:200})
            }
        })
    })
}