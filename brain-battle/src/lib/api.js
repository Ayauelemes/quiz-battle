export const API_BASE = "http://127.0.0.1:5000/api";

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
