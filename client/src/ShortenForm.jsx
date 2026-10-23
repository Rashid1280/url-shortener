import "./ShortenForm.css";

export default function ShortenForm({
  url, setUrl,
  alias, setAlias,
  minutes, setMinutes,
  showAdvanced, setShowAdvanced,
  loading, error, result, shortUrl,
  onSubmit,
}) {
  return (
    <main className="card">
      <h1>Tiny</h1>
      <p>Paste a long link, get a short one.</p>

      <form onSubmit={onSubmit}>
        <input
          type="url"
          required
          placeholder="https://example.com/very/long/link"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          type="button"
          className="link-btn"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          {showAdvanced ? "Hide" : "Show"} advanced options
        </button>

        {showAdvanced && (
          <div className="advanced">
            <input
              type="text"
              placeholder="Custom alias (5-15 letters, numbers, hyphens)"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
            />
            <input
              type="number"
              min="1"
              placeholder="Expires in (minutes)"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
            />
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result">
          <a href={shortUrl} target="_blank" rel="noopener noreferrer">
            {shortUrl}
          </a>
          {result.expiresAt && (
            <p>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
          )}
        </div>
      )}
    </main>
  );
}