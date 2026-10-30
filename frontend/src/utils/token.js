export function getTokenClaims(token) {
  if (!token) return null;

  try {
    const encodedPayload = token.replace(/^Bearer\s+/i, "").split(".")[1];
    if (!encodedPayload) return null;

    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(encodedPayload.length + ((4 - (encodedPayload.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(base64));
    return payload && typeof payload === "object" ? payload : null;
  } catch (error) {
    console.error("Không thể đọc thông tin token đăng nhập:", error);
    return null;
  }
}

export function getUsableToken() {
  const token = localStorage.getItem("token")?.trim();
  if (!token) return null;

  const claims = getTokenClaims(token);
  if (!claims || typeof claims.exp !== "number" || claims.exp * 1000 <= Date.now()) {
    localStorage.removeItem("token");
    return null;
  }

  return token;
}
