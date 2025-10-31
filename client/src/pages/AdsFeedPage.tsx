import React from "react";
import { useQuery } from "@tanstack/react-query";
import useLoadPixels, { Pixel } from "../hooks/useLoadPixels";

export async function fetchPixels(): Promise<{
  success: boolean;
  message?: string;
  data: Pixel[];
}> {
  const res = await fetch("/api/pixels", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch pixels: ${res.status}`);
  }
  return res.json();
}

export default function AdsFeedPage() {
  const { data, isLoading, isError, error } = useQuery<
    { success: boolean; message?: string; data: Pixel[] },
    Error
  >({
    queryKey: ["pixels"],
    queryFn: fetchPixels,
    staleTime: 1000 * 60 * 5,
  });

  const pixels: Pixel[] = data?.data ?? [];

  const { loadedPlatforms, trackEvent } = useLoadPixels(pixels);

  return (
    <div style={{ padding: 16 }}>
      <h1>Ads Feed — Pixels</h1>

      {isLoading && <p>Loading pixels...</p>}
      {isError && (
        <p style={{ color: "red" }}>
          Error loading pixels: {(error as any)?.message ?? String(error)}
        </p>
      )}

      {!isLoading && pixels.length === 0 && <p>No pixels configured.</p>}

      {pixels.length > 0 && (
        <div>
          <h2>Configured pixels</h2>
          <ul>
            {pixels.map((p: Pixel) => {
              const key = `${p.platform}:${p.pixelId}`;
              const loaded = Array.from(loadedPlatforms).some((x) =>
                x.includes(p.pixelId)
              );
              return (
                <li key={p.id} style={{ marginBottom: 12 }}>
                  <strong>{p.name ?? p.platform}</strong> —{" "}
                  <em>{p.platform}</em>
                  <div>id: {p.pixelId}</div>
                  <div>
                    Status: {loaded ? "Loaded" : "Loading / Not loaded"}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button
                      onClick={() => trackEvent(p.platform as any, "PageView")}
                      style={{ marginRight: 8 }}>
                      Track PageView
                    </button>
                    <button
                      onClick={() =>
                        trackEvent(p.platform as any, "TestEvent", {
                          test: true,
                        })
                      }>
                      Track TestEvent
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
