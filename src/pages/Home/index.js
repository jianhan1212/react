import { useState, useEffect } from "react";

const Apple=()=>{
    const [price,setPrice]=useState(0);

    useEffect(()=>{
        setPrice(prePrice=>prePrice+10)
        setPrice(prePrice=>prePrice+10)
        setPrice(prePrice=>prePrice+10)
    },[])

    useEffect(()=>{
        console.log(price);
    },[price])

    return(
        <div>
            <p> Apple is ${price} </p>
        </div>
    )
}


export default Apple;