"use client";

import { useEffect } from "react";
import { trackEvent, type AnalyticsEventName } from "@/lib/consent";

export function AnalyticsView({ event }: { event: AnalyticsEventName }) {
  useEffect(() => {
    trackEvent(event);
  }, [event]);

  return null;
}
