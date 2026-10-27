import { useState } from "react";
import ShortenForm from "./ShortenForm";
import { shortenUrl } from "./api";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const shortUrl = result ? `${API_URL}/${result.code}` : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    const payload = { url };
    if (alias.trim()) {
      payload.alias = alias.trim();
    }
    if (minutes !== "") {
      payload.expiresInMinutes = Number(minutes);
    }
    try {
      const data = await shortenUrl(payload);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ShortenForm
      url={url}
      setUrl={setUrl}
      alias={alias}
      setAlias={setAlias}
      minutes={minutes}
      setMinutes={setMinutes}
      showAdvanced={showAdvanced}
      setShowAdvanced={setShowAdvanced}
      loading={loading}
      error={error}
      result={result}
      shortUrl={shortUrl}
      onSubmit={handleSubmit}
    />
  );
}

export default App;
