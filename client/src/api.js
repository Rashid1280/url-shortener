const API_URL = import.meta.env.VITE_API_URL;

export async function shortenUrl(payload) {
  let res;
  try {
    res = await fetch(`${API_URL}/api/shorten`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Could not reach the server.", { cause: error });
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || "Something went wrong on our side");
  }
  return data;
}
