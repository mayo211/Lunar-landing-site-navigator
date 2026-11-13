// All calls to the backend live here.
import type { Site, VisibilityRequest, VisibilityResponse } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function readError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    return typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
  } catch {
    return `${response.status} ${response.statusText}`;
  }
}

export async function getSites(): Promise<Site[]> {
  const response = await fetch(`${API_URL}/api/sites`);
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function getVisibility(request: VisibilityRequest): Promise<VisibilityResponse> {
  const response = await fetch(`${API_URL}/api/visibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
