export const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) || "/api";

export async function loginPassword(username: string, password: string) {
  const res = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username,
      password,
      scope: "",
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as any));
    throw new Error((err as any)?.detail ?? "Login failed");
  }

  const data = (await res.json()) as {
    access_token: string;
    token_type: string;
  };

  // Store token for later requests
  localStorage.setItem("access_token", data.access_token);

  return data;
}

export function getAuthHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function googleOAuthUrl() {
  return `${API_URL}/auth/google`;
}

export async function signupPassword(
  username: string,
  email: string,
  password: string
) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as any));
    throw new Error((err as any)?.detail ?? "Signup failed");
  }

  // Auto-login after successful signup
  return loginPassword(username, password);
}

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (res.status === 401) {
    // Token missing/expired → force logout
    localStorage.removeItem("access_token");
    window.location.href = "/login"; // or use your router
    throw new Error("Unauthorized - redirecting to login");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as any));
    throw new Error((err as any)?.detail ?? "Failed to fetch users");
  }

  return res.json();
};

/**
 * Update a user's role
 */
export const updateUserRole = async (userId: number, newRole: string) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}/role?role=${newRole}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("access_token");
    window.location.href = "/login";
    throw new Error("Unauthorized - redirecting to login");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as any));
    throw new Error((err as any)?.detail ?? "Failed to update user role");
  }

  return res.json();
};





export const LULC_COLORS: Record<number, string> = {
  1: "#419bdf",
  2: "#397d49",
  4: "#7a87c6",
  5: "#e49635",
  7: "#c4281b",
  8: "#a59b8f",
  9: "#a8ebff",
  10: "#616161",
  11: "#e3e2c3",
};

export async function getRasterGeoJSON(
  year: string,
  opts?: {
    band?: number;
    mergeByValue?: boolean;
    simplifyTolerance?: number;
    maxFeatures?: number;
    colorMap?: Record<number, string>;
  }
) {
  const body = {
    year,
    band: opts?.band ?? 1,
    merge_by_value: opts?.mergeByValue ?? true,
    simplify_tolerance: opts?.simplifyTolerance ?? 0.0002,
    max_features: opts?.maxFeatures ?? 5000,
    color_map: Object.fromEntries(
      Object.entries(opts?.colorMap ?? LULC_COLORS).map(([k, v]) => [
        k,
        v.startsWith("#") ? v.replace("#", "0x") : v,
      ])
    ),
  };

  const res = await fetch(`${API_URL}/raster/geojson`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({} as any));
    throw new Error((err as any)?.detail ?? "Failed to fetch raster GeoJSON");
  }

  return res.json() as Promise<{ year: string; table_name: string; geojson: any }>;
}

export function rasterOverlayUrl(year: string) {
  return `${API_URL}/raster/${year}/overlay.png`;
}



export function get_lulc_by_year(year: string) {
  return `${API_URL}/raster/${year}/overlay.png`;
}







export function get_lulc_classes_geojson(year: string) {
  return `${API_URL}/raster/${year}/classes-geojson`;
}


export async function get_lulc_classes_all_years() {
  const res = await fetch(`${API_URL}/raster/all-years/classes-geojson`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.detail ?? "Failed to fetch all years GeoJSON");
  }
  return res.json() as Promise<Record<string, GeoJSON.FeatureCollection>>;
}

