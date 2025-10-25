"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

export default function RequireDoctor({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);

      // ✅ check expiration
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/auth/login");
        return;
      }

      // ✅ allow only doctors
      if (decoded.role !== "doctor") {
        router.push("/unauthorized");
        return;
      }

      setAuthorized(true);
    } catch (error) {
      console.error("RequireDoctor decode error:", error);
      router.push("/auth/login");
    }
  }, [router]);

  return authorized ? children : null;
}
