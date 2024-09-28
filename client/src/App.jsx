import { useState } from 'react'
import axios from 'axios';
import './App.css'

function App(){

  const [amount,setAmount] = useState(0);
  let data ={
    "name":"vikas",
    "amount":amount,
    "number":"7896589989",
    "MID": "MID"+ Date.now(),
    "transactionId":"T"+Date.now()
  }

  async function handlepay(){
    try {
      await axios.post("http://localhost:8000/order",data).then(res=>{
         console.log(res.data);
         if(res.data.success==true){
          window.location.href=res.data.data.instrumentResponse.redirectInfo.url
         }
      }).catch(error=>{
        console.log(error)
      })

    } catch (error) {
      console.log(error)
    }
  }

  function handleamountchange(e){
    setAmount(e.target.value)
  }


  return (
    <>
      <div>
        <input type="number" value={amount} onChange={handleamountchange} />
      </div>
      <button onClick={handlepay}>Pay Now</button>
    </>
  )

}
export default App;
