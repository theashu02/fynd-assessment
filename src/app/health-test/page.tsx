"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Probe = "loading" | "ok" | "error";

export default function HealthTestPage() {
  const [probe, setProbe] = useState<Probe>("loading");
  const [detail, setDetail] = useState("Calling api.health.get() ...");

  useEffect(() => {
    api
      .health.get()
      .then(({ data, error }) => {
        if (error) {
          setProbe("error");
          setDetail(JSON.stringify(error.value ?? error));
          return;
        }
        // `data` is inferred from the server: { ok: true }.
        if (data?.ok === true) {
          setProbe("ok");
          setDetail(JSON.stringify(data));
        } else {
          setProbe("error");
          setDetail(JSON.stringify(data));
        }
      })
      .catch((err: unknown) => {
        setProbe("error");
        setDetail(err instanceof Error ? err.message : "Request failed");
      });
  }, []);

  return (
    <main className="flex flex-1 items-center justify-center bg-background p-6 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Eden connection probe</CardTitle>
          <CardDescription>
            GET /api/health through the Eden Treaty client
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          {probe === "loading" && <Badge variant="secondary">loading</Badge>}
          {probe === "ok" && <Badge>connected</Badge>}
          {probe === "error" && <Badge variant="destructive">failed</Badge>}
          <code className="text-sm text-muted-foreground">{detail}</code>
        </CardContent>
      </Card>
    </main>
  );
}
