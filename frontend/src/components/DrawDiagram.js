import React, {useState, useEffect} from "react"
const dagre = require("dagre")

function DrawDiagram() {
    const [data, setData] = useState([]);
    useEffect(() => {
        fetch("/output/").then(res => {
            if (res.ok) {
                return res.json()
            }
        }).then(jsonRes => setData(jsonRes['0']))
    })

    return (<div>
        {data}
    </div>)
}

export default DrawDiagram;
