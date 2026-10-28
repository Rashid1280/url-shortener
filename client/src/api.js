const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, options);
  } catch (error) {
    throw new Error("Could not reach the server.", { cause: error });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 429) {
      const seconds = Number(res.headers.get("Retry-After"));
      throw new Error(
        `Too many requests. Please try again in ${seconds} seconds.`,
      );
    }
    throw new Error(data?.error || "Something went wrong on our side");
  }
  return data;
}

export function shortenUrl(payload) {
  return request("/api/shorten", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
export function getStats(code) {
  return request(`/api/stats/${encodeURIComponent(code)}`);
}
