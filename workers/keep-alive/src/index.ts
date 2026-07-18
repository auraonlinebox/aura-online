export default {
  async scheduled(_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) {
    const urls = [
      "https://aura-online-y1k8.onrender.com",
      "https://aura-online.es",
    ];

    const results = await Promise.allSettled(
      urls.map((url) =>
        fetch(url, { method: "GET", signal: AbortSignal.timeout(30000) })
      )
    );

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Keep-alive failed:", result.reason);
      }
    }
  },
} satisfies ExportedHandler<Env>;
