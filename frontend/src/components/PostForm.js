import React, { useState } from "react"
import Axios from "axios"

function PostForm() {
    const url = "http://localhost:8060/input/"
    const [data, setData] = useState({
        company: "",
        docType: "",
        docID: ""
    })

    function handle(e) {
        const newData = {...data}
        newData[e.target.id] = e.target.value
        setData(newData)
    }

    function submit(e) {
        e.preventDefault()
        Axios.post(url, {
            company: data.company, 
            docType: data.docType, 
            docID: data.docID
        }, {headers: {
            "Content-Type": "application/json"
        }}).then(res => {
            console.log(res.data)
        }).catch(error => {
            console.log(error)
        })
    }

    return (
        <div>
            <form onSubmit={(e) => submit(e)}>
                <input onChange={(e) => handle(e)} id="company" value={data.company} placeholder="Company" type="text"></input>
                <input onChange={(e) => handle(e)} id="docType" value={data.docType} placeholder="Document Type" type="text"></input>
                <input onChange={(e) => handle(e)} id="docID" value={data.docID} placeholder="Document ID" type="text"></input>
                <button>Submit</button>
            </form>
        </div>
    );
}

export default PostForm;
