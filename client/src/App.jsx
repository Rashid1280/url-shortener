import { useState } from "react";
import ShortenForm from "./ShortenForm";
import { shortenUrl, getStats } from "./api";
import StatsCheck from "./StatsCheck";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const [statsCode, setStatsCode] = useState("");
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState(null);
  const [stats, setStats] = useState(null);

  const shortUrl = result ? `${API_URL}/${result.code}` : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    setCopied(false);
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

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Could not copy. Please copy the link manually.");
    }
  }

  async function handleCheck(e) {
    e.preventDefault();
    setStatsError(null);
    setStatsLoading(true);
    setStats(null);
    try {
      const data = await getStats(statsCode.trim());
      setStats(data);
    } catch (err) {
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }

  return (
    <div className="page">
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
        copied={copied}
        onCopy={handleCopy}
      />
      <StatsCheck
        code={statsCode}
        setCode={setStatsCode}
        loading={statsLoading}
        error={statsError}
        stats={stats}
        onCheck={handleCheck}
      />
    </div>
  );
}

export default App;
