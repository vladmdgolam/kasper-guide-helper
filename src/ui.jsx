import * as React from "react"
import { useEffect } from "react"
import * as ReactDOM from "react-dom"
import "./ui.css"

function App() {
  const inputRef = React.useRef(null)
  const [value, setValue] = React.useState(3)
  const [closest, setClosest] = React.useState(null)
  // const [auto, setAuto] = React.useState(true)

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: "start" } }, "*")
  }, [])

  // add event listener for messages from the plugin controller
  const handleMessage = (event) => {
    const { type, count, closest } = event.data.pluginMessage
    if (type === "ratio") {
      setValue(count)
      setClosest(closest)
      inputRef.current.focus()
    }
  }

  useEffect(() => {
    window.onmessage = handleMessage
    return () => {
      window.onmessage = null
    }
  }, [])

  const onCreate = () => {
    const count = Number(value)
    parent.postMessage(
      { pluginMessage: { type: "apply-guide", count, closest } },
      "*"
    )
  }

  const onCancel = () => {
    parent.postMessage({ pluginMessage: { type: "cancel" } }, "*")
  }

  const handleChange = (e) => {
    setValue(e.target.value)
  }

  return (
    <main>
      <header>
        <h2>Kaspersky Guide Helper</h2>
      </header>
      <section>
        <div>
          {closest && (
            <p>
              Ближайшее значение: <strong>{closest + "→" + value}</strong>
            </p>
          )}
        </div>
        <input
          id="input"
          type="number"
          min="0"
          ref={inputRef}
          value={value}
          // placeholder={value}
          onChange={handleChange}
        />
        <label htmlFor="input">Logo Count</label>
      </section>
      <footer>
        <button className="brand" onClick={onCreate}>
          Create
        </button>
        <button onClick={onCancel}>Cancel</button>
      </footer>
    </main>
  )
}

ReactDOM.render(<App />, document.getElementById("react-page"))
