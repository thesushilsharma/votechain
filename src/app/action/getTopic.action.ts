export async function getTopicsServer() {
    const res = await fetch(process.env.API_BASE_URL + "api/topics", {
      next: { tags: ["topics"] },
    });
    if (!res.ok) return [];
    return res.json();
  }