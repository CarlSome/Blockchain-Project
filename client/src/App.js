import React, { Component } from 'react'
import {Helmet} from "react-helmet";
import SimpleStorageContract from './contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import './App.css'
import logo from './logo.svg';

const ipfsAPI = require('ipfs-api');	// 引入IPFS包
const ipfs = ipfsAPI({	//连接到IPFS节点
	host: 'localhost',
	port: '5001',
	protocol: 'http'
});

const contract = require('truffle-contract')
const simpleStorage = contract(SimpleStorageContract) // 获取存储合约对象

// Declaring this for later so we can chain functions on SimpleStorage.
let account;
let contractInstance;
var contractAddress = '0xccd458cd99fd00769e1d9100d8e0c241120eab92';

// 编写上传文件到IPFS的Promise函数
let saveTextBlobOnIpfs = (blob) => {
	return new Promise(function(resolve, reject) {
		const descBuffer = Buffer.from(blob.result);
		ipfs.add(descBuffer).then((response) => {
			console.log(response)
			resolve(response[0].hash);
		}).catch((err) => {
			console.error(err)
			reject(err);
		})
	})
}

// 创建React组件
class App extends Component {
	// 构造函数
	constructor(props) {
		super(props)
		// 状态初始化
		this.state = {
			blockChainHash: null,
			web3: null,
			address: null,
			imgHash: null,
			isWriteSuccess: false
		}
	}

	// 组件启动准备
	componentWillMount() {
		// 连接IPFS的Peers
		ipfs.swarm.peers(function(err, res) {
			if (err) {
				console.error(err);
			} else {
				console.log("IPFS在线节点:"+res);
			}
		});

		// 连接到web3
		getWeb3.then(results => {
			this.setState({
				web3: results.web3
			})
			// 初始化合约
			this.instantiateContract()
		}).catch(() => {
			console.log('Error in action registerWeb3')
		})
	}

	// 初始化合约函数
	instantiateContract = () => {
		// 设置合约通信服务提供者
		simpleStorage.setProvider(this.state.web3.currentProvider);
		// 设置账户
		this.state.web3.eth.getAccounts((error, accounts) => {
			account = accounts[0];
			simpleStorage.at(contractAddress).then((contract) => {
				console.log("合约地址:"+contract.address);
				contractInstance = contract;
				this.setState({
					address: contractInstance.address
				});
				return;
			});
		})
	}
  
  // 渲染网页
	render() {
		return (
			<div className="App"> 
				<Helmet>
					<meta charset="utf-8"></meta>
					<link rel="shortcut icon" href="/favicon.ico"></link>
    				<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"></meta>
    				<meta name="theme-color" content="#000000"></meta>
					<link rel="manifest" href="/manifest.json"></link>
					<title>Blockchain Storage System</title>
				</Helmet>
				<header className="App-header">
					<h1>Blockchain Storage System</h1>
					<img src={logo} className="App-logo" alt="logo" />
					<p>合约地址：{this.state.address}</p>
					<a className="App-link" href={"https://ropsten.etherscan.io/address/"+contractAddress}>查看合约</a>
        		</header>	
				<div>
					<h2>选择文件</h2>
        			<label id="file">选择上传的文件</label>
					<input type="file" ref="file" id="file" name="file" multiple="multiple"/>
				</div>
      			<div>
					<h2>上传文件至服务器</h2>
        			<button onClick={() => {
            			var file = this.refs.file.files[0];
            			var blob = new FileReader();
            			blob.readAsArrayBuffer(file)
						blob.onloadend = function(e) {
              				console.log(blob);
              				saveTextBlobOnIpfs(blob).then((hash) => {
                				console.log("文件的哈希值:"+hash);
                				this.setState({
									imgHash: hash
								});
              				});

            			}.bind(this);
					}}>上传</button>
				</div>
				{
					this.state.imgHash ?
						<div>
							<h2>写入区块链</h2>
					  		<button onClick={() => {
						  		contractInstance.upload(this.state.imgHash, {from: account}).then(() => {
									console.log('文件的hash值已经写入到区块链！');
									this.setState({
										isWriteSuccess: true
									});
								});
							}}>写入</button>
						</div>
						: <div/>
				}
				{
        			this.state.isWriteSuccess ? 
						<div>
              				<h2>读取区块链</h2>
              				<button onClick={() => {
                  				contractInstance.download({from: account}).then((data) => {
                    				console.log("区块链读取的hash:"+data);
                    				this.setState({
										blockChainHash: data
									});
                  				});
                			}}>读取</button>
            			</div>
          				: <div/>
      			}
				{
					this.state.blockChainHash ?
						<div>
							<h3>从区块链读取到的hash值：{this.state.blockChainHash}</h3>
						</div>
						: <div/>
      			}
				{
					this.state.blockChainHash ?
						<div>
							<a className="App-link" href={"http://localhost:8080/ipfs/" + this.state.imgHash}>文件下载链接</a>
              				<img alt="" style={{ width: 1600}} src={"http://localhost:8080/ipfs/" + this.state.imgHash}/>
            			</div>
          				: <img alt=""/>
      			}
			</div>
		);
	}
}

export default App
