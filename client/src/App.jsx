
import './App.css'
async function handleClick() {
  try {
    const res = await fetch("http://localhost:3000/api/shorten", {
      method: 'post',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url : "https://nearaiims.vercel.app/" }),
    });
    const data = await res.json();
    console.log(data);
  } catch (error) {
    console.error("fetch failed:", error);
  }
}

function App() {

  return (
    <>
      <section id="center">
          <h1>Get started</h1>
        <button
          type="button"
          className="counter"
          onClick={() => handleClick()}
        >
        Tiny
        </button>
      </section>

      <div className="ticks"></div>
    </>
  )
}

export default App
