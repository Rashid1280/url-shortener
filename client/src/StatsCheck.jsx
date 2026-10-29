export default function StatsCheck({
  code,
  setCode,
  loading,
  error,
  stats,
  onCheck,
}) {
  return (
    <section className="band stats-band">
      <h2>Check a link's stats</h2>
      <form className="row" onSubmit={onCheck}>
        <input
          type="text"
          required
          placeholder="Short code, e.g. abc123"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Check"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {stats && (
        <dl className="stats">
          <dt>Clicks</dt>
          <dd>{stats.clicks}</dd>
          <dt>Created</dt>
          <dd>{new Date(stats.createdAt).toLocaleString()}</dd>
          <dt>Expires</dt>
          <dd>
            {stats.expiresAt
              ? new Date(stats.expiresAt).toLocaleString()
              : "Never"}
          </dd>
          <dt>Points to</dt>
          <dd>{stats.url}</dd>
        </dl>
      )}
    </section>
  );
}
