import React, {useState, useEffect} from "react"

function Data() {
    const [data, setData] = useState([])
    useEffect(() => {
        fetch("/data/").then(res => {
            if (res.ok) {
                return res.json()
            }
        }).then(jsonRes => setData(jsonRes.params))
    }, [])

    return (<div>
        {data.map(item => <li>{item}</li>)}
    </div>)
}

export default Data
