import "./App.css";
import * as ethers from 'ethers';
import {useState, useEffect} from'react'
import Excel from 'exceljs';
import { abi,ERC20ABI, mantleContract } from './components/abi/abi';
import Header from "./components/header";


function App() {

  const [address,setAddress] = useState("")
  const [connected,setConnected] = useState("Connect")
  const [contractbar,showcontractbar] = useState("hidden")
  const[values,setvalues] = useState([])
  const[userdenytrans,setUserDenyTrans] = useState("hidden")
  const[addressarray,setAddressarray] = useState([])
  const [clicked,setClicked] = useState('ether')
  const [showResult,setshowResult] = useState(false)
  const [ERC20,setERC20] = useState('')
  const [balance,setbalance] = useState("0 ETH")
  const ethereum = window.ethereum;


useEffect(

  ()=>{
    async function connectButton(){
      const res = await ethereum.request({ method: 'eth_accounts' })
      if (res.length === 0) {
       
      } else {
 
        try {
          await ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: "0xe704" }],
          });
          const balances = await ethereum.request({
            method: 'eth_getBalance',
            params: [res[0], 'latest'],
          });

          setbalance((ethers.formatEther(balances)).substring(0, 5)+ " "+"ETH")

          } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: "0xe704",
              rpcUrls: ['https://linea-goerli.infura.io'],
              chainName: 'Linea',
              nativeCurrency: { name: 'ETH', decimals: 18, symbol: 'ETH' },
              blockExplorerUrls: ['https://explorer.goerli.linea.build'],
              iconUrls: [''],
            }],
            }).then(response => console.log(response))
          }
          }


        setConnected(res[0].slice(0,5)+"..."+res[0].slice(res[0].length-5,res[0].length))
  
        setAddress(res[0]);
      }
    }
    connectButton()
    
  }

)


  const connect= async () => {
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    
    
    await provider.send("eth_requestAccounts", []).then(async res=>{
      
      setAddress(res[0]);
    
      if(res[0]){

        setConnected(res[0].slice(0,5)+"..."+res[0].slice(res[0].length-5,res[0].length))

        const balances = await ethereum.request({
          method: 'eth_getBalance',
          params: [res[0], 'latest'],
        });

        setbalance((ethers.formatEther(balances)).substring(0, 5)+" "+"ETH")

      }
  
    })
  }

  const ether = () =>{

    showcontractbar("hidden")
    setClicked('ether')

  }
  
  const tokens = () =>{
    showcontractbar("visible")
    setClicked('tokens')
  }

  const getContractAddress = (e) =>{
    setERC20(e.target.value)
  }
 
  const handleSendClick = (e) => {
      
    const file = e.target.files[0];
    const wb = new Excel.Workbook();
    const reader = new FileReader();

    reader.readAsArrayBuffer(file);
    reader.onload = () => {
    
        const buffer = reader.result;
        wb.xlsx.load(buffer).then((workbook) => {
          var array1 =[];
          var array2 = [];
            workbook.eachSheet((sheet, id) => {
                sheet.eachRow((row, rowIndex) => {
                 
                  array1.push(row.values[1])
                  array2.push(row.values[2])
               
                });
                setAddressarray(array1)
                setvalues(array2)
            });
        });

       
    };

    setshowResult(true)
};

function arraySum(arr) {
  let sum = 0;

  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
    
  }
  return sum;
}


function multiplyArray(arr) {
  const multipliedArr = arr.map((num) => ethers.parseEther(num.toString()));
  
  return multipliedArr;
}
function sumArray(arr) {
  let sum = 0;
  arr.forEach(numStr => {
    let num = parseInt(numStr);
    sum += num;
  });
  return sum;
}
const sendEther= async()=>{
 
  try{
    
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(mantleContract,abi,signer)
  const valuesarray =await multiplyArray(values);
  const gasPrice = ethers.parseUnits('0.00000020', 'gwei');
  const gasLimit = values.length * 21000;
  const totalEther = sumArray(valuesarray).toString();
  await contract.disperseEther(addressarray,valuesarray, {value:totalEther,gasLimit,gasPrice})
  
 }catch(err){
  if(err){setUserDenyTrans("visible") }
 }
  
}


const sendTokens = async()=>{
 try {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const signer = await provider.getSigner()
  const contract = new ethers.Contract(mantleContract,abi,signer)
  const valuesarray = multiplyArray(values);
  const Erc20ContractInstance = new ethers.Contract(ERC20,ERC20ABI,signer);
  const getAllowance = await Erc20ContractInstance.allowance(address,mantleContract);

 const gasPrice = ethers.parseUnits('0.00000020', 'gwei'); // Set gas price to 10 gwei
 const gasLimit = values.length*21000; // Set gas limit to 1 million
  getAllowance<arraySum(values)? Erc20ContractInstance.approve(mantleContract,100000000000,{gasPrice, gasLimit}).await():console.log('')
  await contract.disperseToken(ERC20,addressarray,valuesarray,{gasPrice, gasLimit})
 
 } catch (error) {
  if(error){
    setUserDenyTrans("visible") }
 }
 
}
  return (
    <div className="App">
      <Header/>
     <nav>
  <div className="navbar-logo">
    <a href="/"><img src="favicon.png" alt="Logo"/></a>
  </div>
  <div className="navbar-buttons">
  <button className="connect-button" style={{marginRight:"5px"}}>{balance}</button>
    <button className="connect-button" onClick={connect}>{connected}</button>
  </div>
</nav>


<div className="frame-22 clip-contents">
      <div className="frame-26 clip-contents">
        <p className="send" style={{fontWeight:"bold"}}>Send</p>
        <div className="frame-28 clip-contents">
        <button className="ether" onClick={ether} >Ether</button>
        </div>
        <div className="frame-29 clip-contents">

          <button className="tokens" onClick={tokens}>Tokens</button>
          
        </div>
      </div >
</div>

<div className="frame-5">
     <div className="input">
      <input type="text" className="text" placeholder='ERC20 Contract Address' value={ERC20} onChange={getContractAddress} style={{"visibility":contractbar}}/>
      <p style={{fontWeight:"bold"}}>Upload a Excel sheet</p>
      <input type="file" name="" id="fileupload" onChange={handleSendClick} /><br/>
     
     </div>
  </div>

<div className='showResult'>
{addressarray.length>0 ?
  <div>
{addressarray.map((item1,index1)=>(
  <div key={index1+index1}>
    {item1}={values[index1]}
  </div>
))}
<p>________________________________________________________</p>
<p> Total ------------------------- = {values.reduce((acc, curr) => acc + curr, 0)} Eth</p>
<button className="sendBtn" onClick={clicked==='ether'?sendEther:sendTokens}>Send</button>
</div>
 : ""
}
<p style={{color:"red",visibility:userdenytrans}}>User Denied Transaction....</p>
</div>

<div className="image-container">
      <a href="https://twitter.com" target="_blank" rel="noreferrer"> <img src="/twitter.png" alt=""/></a>
 <a href="htpps://t.me/amma96" target="_blank" rel="noreferrer">  <img src="/telegram.png" alt=""/></a>
 <a href="https://instagram.com" target="_blank" rel="noreferrer">  <img src="/instagram.png" alt=""/></a>
<a href="https://github.com/bvvvp009" target="_blank" rel="noreferrer"><img src="/github.png" alt=""/></a>
  

</div>

    </div>
  );
}

export default App;
