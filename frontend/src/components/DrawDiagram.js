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

  const fieldToLabelDict = {
    "PURCHNAME": "Vendor Name",
    "PURCHSTATUS": "Status",
    "DELIVERYDATE": "Delivery Date",
    "Total Amount": "Total Amount",
    "DELIVERYNAME": "Delivery Site",
    "TRANSDATE": "Posting Date",
    "FIXEDDUEDATE": "Due Date",
    "PAYMMODE": "Payment Method",
    "ORDERACCOUNT": "Vendor Account"
  }

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

  function callAPI(input) {
    console.log(input)
    Axios.get("/request/", {
      params: {
        company: input.company,
        docType: input.docType,
        docID: input.docID
      }
    }).then(res => {return res.data})
      .then(jsonRes => {
        // console.log(jsonRes)
        setEdges(jsonRes.Edges)
        setVertices(jsonRes.Vertices)
    })
  }

  function render() {
    d3.select("g").remove()
    d3.select(".table").remove()
    d3.select(".reminder").remove()

    const svg = d3.select("svg")
    const g = svg.append("g")
    const table = d3.select("body").append("table").classed("table", true)
    const tbody = table.append("tbody")
    const reminder = d3.select(".diagram")
      .append("div")
      .classed("reminder", true)
      .text("Set as center? ")
    
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
      .attr("rx", "5px")
    g.append("rect")
      .classed("bar", true)
      .attr("y", 5 + maxNum * 18 + "vh")
      .attr("rx", "5px")

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
          .attr("x", 18 * matchTypeToPos(docType) + 1 + "vw")
          .attr("y", (numDocs[docType] - 1) * 18 + 6 + "vh")
          .attr("rx", "5px")
          .attr("fill", "#FFFDF0")
          .on("mouseover", function() {
            d3.select(this).style("stroke-width", "0.5vh")
            d3.selectAll(".data").each(function(d) {
              if (relDocs.includes(d.index)) d3.select(this).style("fill", "#dfdecc")
            })
            d3.selectAll(".ledger").each(function(d) {
              if (d.from === i) d3.select(this).style("fill", "#dfdecc")
            })
          })
          .on("mouseout", function() {
            d3.selectAll(".data").each(function(d) {
              if (!d.isClicked) d3.select(this).style("fill", "#fffbe3").style("stroke-width", 0)
            })
            d3.selectAll(".ledger").each(function(d) {
              if (!d.isClicked) d3.select(this).style("fill", "#fffbe3").style("stroke-width", 0)
            })
          })
          .on("click", function(e, data) {
            data.isClicked = !data.isClicked
            d3.selectAll(".data").each(function(d) {
              if (relDocs.includes(d.index)) {
                d.isClicked = data.isClicked
                d3.select(this).style("fill", "#dfdecc")
              }
            })
            d3.selectAll(".ledger").each(function(d) {
              if (d.from === i) {
                d.isClicked = data.isClicked
                d3.select(this).style("fill", "#dfdecc")
              }
            })
          })
        const textLayerLabel = g.append("text")
          .style("fill", "black")
          .attr("y", (numDocs[docType] - 1) * 18 + 8.5 + "vh")
          .attr("font-size", "1.2vh")
          .attr("font-weight", "bold")
          .style("text-anchor", "start")
        Object.keys(keyInfo).forEach(function(key) {
          if (key !== "Type" && key !== "ID") {
            textLayerLabel.append("tspan")
              .attr("x", 18 * matchTypeToPos(docType) + 2 + "vw")
              .attr('dy', "2.5vh")
              .text(fieldToLabelDict[key])
          }
        })
        const textLayerValue = g.append("text")
          .style("fill", "black")
          .attr("y", (numDocs[docType] - 1) * 18 + 8.5 + "vh")
          .attr("font-size", "1.2vh")
          .style("stroke-width", 1)
          .style("text-anchor", "end")
        Object.keys(keyInfo).forEach(function(key) {
          if (key !== "Type" && key !== "ID") {
            textLayerValue.append("tspan")
              .attr("x", 18 * matchTypeToPos(docType) + 14 + "vw")
              .attr('dy', "2.5vh")
              .text(() => {
                if (key === "Total Amount") return keyInfo[key] + " USD"
                else return keyInfo[key]
              })
          }
        })

        g.append("rect")
          .classed("title", true)
          .datum(keyInfo.ID)
          .attr("x", 18 * matchTypeToPos(docType) + 1 + "vw")
          .attr("y", (numDocs[docType] - 1) * 18 + 6 + "vh")
          .attr("rx", "5px")
        g.append("text")
          .text(keyInfo.ID)
          .attr("x", 18 * matchTypeToPos(docType) + 2 + "vw")
          .attr("y", (numDocs[docType] - 1) * 18 + 8 + "vh")
          .attr("font-size", "1.6vh")
          .attr("font-weight", "bold")
          .attr("fill", "white")

        g.append("svg:image")
          .attr('href', "https://icons.iconarchive.com/icons/icons8/windows-8/512/Messaging-More-icon.png")
          .classed("more-icon", true)
          .datum({"isClicked": false, "data": vertice})
          .attr("x", 18 * matchTypeToPos(docType) + 13 + "vw")
          .attr("y", (numDocs[docType] - 1) * 18 + 6.5 + "vh")
          .on("mouseover", function() {
            d3.select(this)
              .attr("cursor", "pointer")
              .style("width", "1.8vh")
              .style("height", "1.8vh")
          })
          .on("mouseout", function() {
            d3.select(this)
              .style("width", "1.5vh")
              .style("height", "1.5vh")
          })
          .on("click", (e, d) => {
            d.isClicked = !d.isClicked
            if (d.isClicked) {
              table.style("visibility", "visible")
              Object.keys(d.data.Header).forEach(key => {
                const tr = tbody.append("tr")
                tr.append("td").html(key)
                tr.append("td").html(d.data.Header[key])
              })
            } else {
              d3.selectAll("tr").remove()
              table.style("visibility", "hidden")
            }
          })
        
        g.append("svg:image")
          .attr('href', "https://icons.iconarchive.com/icons/pixelkit/swanky-outlines/256/01-Pin-icon.png")
          .classed("more-icon", true)
          .datum({x: matchTypeToPos(docType), y: numDocs[docType], isClicked: false})
          .attr("x", 18 * matchTypeToPos(docType) + 12 + "vw")
          .attr("y", (numDocs[docType] - 1) * 18 + 6.5 + "vh")
          .on("mouseover", function() {
            d3.select(this)
              .attr("cursor", "pointer")
              .style("width", "1.8vh")
              .style("height", "1.8vh")
          })
          .on("mouseout", function() {
            d3.select(this)
              .style("width", "1.5vh")
              .style("height", "1.5vh")
          })
          .on("click", (e, d) => {
            d.isClicked = !d.isClicked
            d3.selectAll(".rem-button").remove()
            if (d.isClicked) {
              reminder.style("left", 18 * d.x + 6 + "vw")
                .style("top", (d.y - 1) * 18 + 3 + "vh")
                .style("visibility", "visible")
              reminder.append("button")
                .classed("rem-button", true)
                .text("Confirm")
                .on("click", () => {
                  const newData = {
                    company: data.company,
                    docType: vertice.keyInfo.Type.toLowerCase(),
                    docID: vertice.keyInfo.ID
                  }
                  callAPI(newData)
                })
              reminder.append("button")
                .classed("rem-button", true)
                .text("Cancel")
                .on("click", () => {reminder.style("visibility", "hidden")})
            } else reminder.style("visibility", "hidden")
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
          .attr("x", 18 * matchTypeToPos(docType) + 1 + "vw")
          .attr("y", 5 + maxNum * 18 + numLedgers[docType] * 6 + "vh")
          .attr("rx", "5px")
          .on("mouseover", function() { 
            d3.select(this).style("fill", "#dfdecc").style("stroke-width", "0.5vh")
            g.selectAll(".data").each(function(d) {
              if (d.index === from) d3.select(this).style("fill", "#dfdecc")
            }) 
          })
          .on("mouseout", function() {
            d3.selectAll(".data").each(function(d) {
              if (!d.isClicked) d3.select(this).style("fill", "#fffbe3").style("stroke-width", 0)
            })
            d3.selectAll(".ledger").each(function(d) {
              if (!d.isClicked) d3.select(this).style("fill", "#fffbe3").style("stroke-width", 0)
            })
          })
          .on("click", function(e, data) {
            data.isClicked = !data.isClicked
            if (data.isClicked) d3.select(this).style("stroke-width", "0.5vh")
            g.selectAll(".data").each(function(d) {
              if (d.index === from) {
                d.isClicked = data.isClicked
                d3.select(this).style("fill", "#dfdecc")
              }
            })
          })
        g.append("text")
          .style("fill", "black")
          .attr("x", 18 * matchTypeToPos(docType) + 3 + "vw")
          .attr("y", 7.5 + maxNum * 18 + numLedgers[docType] * 6 + "vh")
          .attr("font-size", "1.8vh")
          .attr("font-weight", "bold")
          .style("text-anchor", "start")
          .attr("cursor", "pointer")
          .text(keyInfo["ID"])  
      }
    })
      
    Object.keys(numDocs).forEach((docType) => {
      g.append("text")
        .attr("position", "absolute")
        .attr("x", matchTypeToPos(docType) * 18 + 1 + "vw")
        .attr("y", "2.75vh")
        .attr("fill", "#D7B653")
        .attr("font-size", "2vh")
        .attr("font-weight", "bold")
        .text(docType+" ("+numDocs[docType]+")")
    })
    
    Object.keys(numLedgers).forEach((docType) => {
      g.append("text")
        .attr("x", matchTypeToPos(docType) * 18 + 1 + "vw")
        .attr("y", 7.5 + maxNum * 18 + "vh")
        .attr("fill", "#D7B653")
        .attr("font-size", "2vh")
        .attr("font-weight", "bold")
        .text(docType+" ("+numLedgers[docType]+")")
    })
  }

  useEffect(() => {
    console.log(submitTimes)
    callAPI(data)
  }, [submitTimes])

  useEffect(() => {
    render()
  }, [vertices])

  return (
    <div className="main-body">
      <div id="dec"></div>
      <h1>Microsoft<br/>Dynamics 365<br/></h1>
      <h2>Entity Relationship<br/>Diagram</h2>
      <h3 id="label1">Company Name</h3>
      <h3 id="label2">Document ID</h3>
      <h3 id="label3">Document Type</h3>
      <form onSubmit={(e) => submit(e)}>
          <input onChange={(e) => handle(e)} id="company" value={data.company} placeholder=" company" type="text"></input>
          <input onChange={(e) => handle(e)} id="docID" value={data.docID} placeholder=" docID" type="text"></input>
          <select onChange={(e) => handle(e)} id="docType">
            <option value = ""> </option>
            <option value = "purchase order">purchase order</option>
            <option value = "purchase receipt">purchase receipt</option>
            <option value = "invoice">invoice</option>
            <option value = "payment">payment</option>
          </select>
          <button id="submit">Submit</button>
      </form>
      <div class="diagram"></div>
      <svg id="svg">svg</svg>
    </div>
  )
}

export default DrawDiagram
