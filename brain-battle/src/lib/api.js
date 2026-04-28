// Allow overriding the API base URL with an environment variable for deployments.
// In Create React App use `REACT_APP_API_BASE` (e.g. https://my-backend.example.com/api)
export const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:5000/api";

export const getAuthHeaders = (user) =>
  user
    ? {
        "x-user-id": String(user.id),
        "x-user-role": user.role,
      }
    : {};

export const getDefaultRoute = (user) => {
  if (!user) {
    return "/";
  }
  if (user.role === "admin") {
    return "/admin";
  }
  if (user.role === "moderator") {
    return "/moderator";
  }
  return "/cabinet";
};
