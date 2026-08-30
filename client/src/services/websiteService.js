import { apiRequest } from "./api";

export async function getWebsites() {
  const response = await apiRequest("/websites");
  return response.data.websites;
}

export async function getWebsite(id) {
  const response = await apiRequest(`/websites/${id}`);
  return response.data.website;
}

export async function createWebsite(website) {
  const response = await apiRequest("/websites", {
    method: "POST",
    body: JSON.stringify(website)
  });
  return response.data.website;
}

export async function updateWebsite(id, changes) {
  const response = await apiRequest(`/websites/${id}`, {
    method: "PATCH",
    body: JSON.stringify(changes)
  });
  return response.data.website;
}

export async function deleteWebsite(id) {
  await apiRequest(`/websites/${id}`, { method: "DELETE" });
}
