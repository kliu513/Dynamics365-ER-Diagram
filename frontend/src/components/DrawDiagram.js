import "./DrawDiagram.css"
import {useState, useEffect} from "react"
import Axios from "axios"
const d3 = require("d3")

function DrawDiagram() {
  const [submitTimes, setSubmitTimes] = useState(0)
  const [data, setData] = useState({
    company: "",
    docType: "",
    docID: ""
  })
  const [vertices, setVertices] = useState([])
  const [edges, setEdges] = useState([])

  const svg = d3.select("svg")
  const g = svg.append("g")
  const popup = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")  
    .style("padding", "5px")
    .style("z-index", "10")
    .style("visibility", "hidden")
  const pageHeight = document.body.offsetHeight
  const pageWidth = document.body.offsetWidth

  function matchTypeToPos(docType) {
    switch (docType) {
      default:
        return -1
      case "Purchase Order":
        return 0
      case "Product Receipt":
        return 1
      case "Invoice":
        return 2
      case "Payment":
        return 3
      case "Product Receipt Ledger":
        return 1
      case "Invoice Ledger":
        return 2
      case "Payment Ledger":
        return 3
    }
  }

  function handle(e) {
    const newData = {...data}
    newData[e.target.id] = e.target.value
    setData(newData)
  }

  function submit(e) {
    e.preventDefault()
    setSubmitTimes(submitTimes + 1)
  }

  function render(input) {
    console.log(input)
    
    g.selectAll("rect").remove()
    g.selectAll("circle").remove()
    g.selectAll("text").remove()
    
    Axios.get("/output/", {
      company: input.company,
      docType: input.docType,
      docID: input.docID
    })
      .then(res => {return res.data})
      .then(jsonRes => {
        setVertices(jsonRes.Vertices)
        setEdges(jsonRes.Edges)
      })

    let numDocs = {
      "Purchase Order": 0,
      "Product Receipt": 0,
      "Invoice": 0,
      "Payment": 0
    } 
    let numLedgers = {
      "Product Receipt Ledger": 0,
      "Invoice Ledger": 0,
      "Payment Ledger": 0
    }
    
    vertices.forEach( vertice => {
      const docType = vertice.keyInfo.Type
      if (docType in numDocs) numDocs[docType] += 1
    })
    const maxNum = Math.max(...Object.values(numDocs))
    Object.keys(numDocs).forEach(key => {numDocs[key] = 0})

    const fromAsKey = {}
    const toAsKey = {}
    edges.forEach(edge => {
      if (edge.From in fromAsKey) fromAsKey[edge.From].push(edge.To)
      else fromAsKey[edge.From] = [edge.To]
    })
    edges.forEach(edge => {
      if (edge.To in toAsKey) toAsKey[edge.To].push(edge.From)
      else toAsKey[edge.To] = [edge.From]
    })
    
    g.append("rect")
      .classed("bar", true)
      .attr("x", pageWidth * 0.05)
      .attr("width", pageWidth * 0.9)
      .attr("y", 30)
    g.append("rect")
      .classed("bar", true)
      .attr("x", pageWidth * 0.05)
      .attr("width", pageWidth * 0.9)
      .attr("y", 100 + maxNum * 100)

    vertices.forEach(function(vertice, i) {
      const keyInfo = vertice.keyInfo
      const docType = keyInfo.Type

      if (Object.keys(numDocs).includes(docType)) {
        numDocs[docType] += 1
        let docsAfter = [i]
        let docsBefore = [i]
        let currIdx = 0
        
        while (currIdx < Object.keys(docsAfter).length) {
          if (docsAfter[currIdx] in fromAsKey) {
            fromAsKey[docsAfter[currIdx]].forEach(val => {
              docsAfter.push(val)
            })
          }
          currIdx++
        }
        currIdx = 0
        while (currIdx < Object.keys(docsBefore).length) {
          if (docsBefore[currIdx] in toAsKey) {
            toAsKey[docsBefore[currIdx]].forEach(val => {
              docsBefore.push(val)
            })
          }
          currIdx++
        }
        const relDocs = docsAfter.concat(docsBefore)

        g.append("rect")
          .datum({"index": i, "isClicked": false})
          .classed("data", true)
          .attr("x", pageWidth * (0.06 + matchTypeToPos(docType) * 0.22))
          .attr("y", numDocs[docType] * 100 - 30)
          .style("fill", "white")
          .on("mouseover", () => { 
            d3.selectAll(".data").each(function(d) {
              if (relDocs.includes(d.index)) d3.select(this).style("fill", "red")
            })
            d3.selectAll(".ledger").each(function(d) {
              if (d.from === i) d3.select(this).style("fill", "red")
            })
          })
          .on("mouseout", function(e, d) {
            if (!d.isClicked) g.selectAll("rect").style("fill", "white")
          })
          .on("click", () => {
            d3.selectAll(".data").each(function(d) {
              d.isClicked = !d.isClicked
              if (relDocs.includes(d.index)) d3.select(this).style("fill", "red")
            })
            d3.selectAll(".ledger").each(function(d) {
              d.isClicked = !d.isClicked
              if (d.from === i) d3.select(this).style("fill", "red")
            })
          })

        g.append("circle")
          .datum({"isClicked": false, "data": vertice})
          .style("stroke", "yellow")
          .style("fill", "blue")
          .attr("r", 5)
          .attr("cx", 300 + matchTypeToPos(docType) * 300)
          .attr("cy", 35 + numDocs[docType] * 100)
          .on("click", (e, d) => {
            d.isClicked = !d.isClicked
            if (d.isClicked) {
              popup.style("visibility", "visible")
                .text(JSON.stringify(d.data.Header))   
                .style("top", (e.pageY-10)+"px")
                .style("left",(e.pageX+10)+"px")
            } else popup.style("visibility", "hidden")
          })
      
        g.append("circle")
          .style("stroke", "yellow")
          .style("fill", "purple")
          .attr("r", 5)
          .attr("cx", 100 + matchTypeToPos(docType) * 300)
          .attr("cy", 35 + numDocs[docType] * 100)
          .on("click", (e) => {
            const newData = {
              company: input.company,
              docType: vertice.keyInfo.Type,
              docID: vertice.keyInfo.ID
            }
            render(newData)
          })

        const textLayer = g.append("text")
          .style("fill", "#f77")
          .attr("x", 100 + matchTypeToPos(docType) * 300)
          .attr("y", 25 + numDocs[docType] * 100)
          .style("stroke-width", 1)
          .style("text-anchor", "start")
        Object.keys(keyInfo).forEach(function(key) {
          if (key !== "Type") {
            textLayer.append("tspan")
              .attr("x", 110 + matchTypeToPos(docType) * 300)
              .attr('dy', 15)
              .text(key + ": " + keyInfo[key])
          }
        })
      } else {
        numLedgers[docType] += 1
        
        let from = -1
        edges.forEach((edge) => {
          if (edge.To === i) from = edge.From
        })

        g.append("rect")
          .datum({"index": i, "isClicked": false, "from": from})
          .classed("ledger", true)
          .attr("x", 100 + matchTypeToPos(docType) * 300)
          .attr("y", 150 + numLedgers[docType] * 50 + maxNum * 100)
          .style("fill", "white")
          .on("mouseover", function() { 
            d3.select(this).style("fill", "red")
            g.selectAll(".data").each(function(d) {
              if (d.index === from) d3.select(this).style("fill", "red")
            }) 
          })
          .on("mouseout", function(e, d) {
            if (!d.isClicked) g.selectAll("rect").style("fill", "white")
          })
          .on("click", function(e, d) {
            d.isClicked = !d.isClicked
            d3.select(this).style("fill", "red")
            g.selectAll(".data").each(function(d) {
              if (d.index === from) {
                d.isClicked = !d.isClicked
                d3.select(this).style("fill", "red")
              }
            })
          })

        const textLayer = g.append("text")
          .style("fill", "#f77")
          .attr("x", 200 + matchTypeToPos(docType) * 300)
          .attr("y", 150 + numLedgers[docType] * 50 + maxNum * 100)
          .style("stroke-width", 1)
          .style("text-anchor", "middle") 
        Object.keys(keyInfo).forEach(function(key) {
          if (key !== "Type") {
            textLayer.append("tspan")
              .attr("x", 150 + matchTypeToPos(docType) * 300)
              .attr('dy', 15)
              .text(key + ": " + keyInfo[key])
          }
        })
      }
    })
  
    Object.keys(numDocs).forEach((docType) => {
      g.append("text")
      .style("fill", "#f77")
      .attr("x", 100 + matchTypeToPos(docType) * 300)
      .attr("y", 100)
      .text(docType+" ("+numDocs[docType]+")")
    })
    
    Object.keys(numLedgers).forEach((docType) => {
      g.append("text")
      .style("fill", "#f77")
      .attr("x", 100 + matchTypeToPos(docType) * 300)
      .attr("y", 170 + maxNum * 100)
      .text(docType+" ("+numLedgers[docType]+")")
    })
  }

  useEffect(() => {
    console.log(submitTimes)
    render(data)
  }, [submitTimes])
    
  svg.attr('height', pageHeight)
  svg.attr('width', pageWidth)
    
  return (
    <div className="main-body">
    <form onSubmit={(e) => submit(e)}>
        <input onChange={(e) => handle(e)} id="company" value={data.company} placeholder="Company" type="text"></input>
        <input onChange={(e) => handle(e)} id="docType" value={data.docType} placeholder="Document Type" type="text"></input>
        <input onChange={(e) => handle(e)} id="docID" value={data.docID} placeholder="Document ID" type="text"></input>
        <button>Submit</button>
    </form>
    <svg>svg</svg>
  </div>
  )
}

export default DrawDiagram
