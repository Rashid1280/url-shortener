import { QRCodeSVG } from "qrcode.react";

export default function ShortenForm({
  url,
  setUrl,
  alias,
  setAlias,
  minutes,
  setMinutes,
  showAdvanced,
  setShowAdvanced,
  loading,
  error,
  result,
  shortUrl,
  onSubmit,
  copied,
  onCopy,
}) {
  return (
    <main className="band">
      <h1>Make long links short</h1>
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
          <div className="result-info">
            <p className="label">Your short link</p>
            <a
              className="short-link"
              href={shortUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {shortUrl}
            </a>
            <button type="button" onClick={onCopy}>
              {copied ? "Copied!" : "Copy link"}
            </button>
            {result.expiresAt && (
              <p>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
            )}
          </div>
          <div className="qr">
            <QRCodeSVG value={shortUrl} size={140} />
          </div>
        </div>
      )}
    </main>
  );
}
