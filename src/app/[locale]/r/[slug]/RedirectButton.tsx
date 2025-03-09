"use client";

import { useEffect } from "react";

export default function RedirectButton({ slug }: { slug: string }) {
  useEffect(() => {
    window.location.href = `/r/${encodeURIComponent(slug)}`;
  }, [slug]);

  return null;
}
