"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { createServer } from "@/shared/api/studio/serverActions";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

export function ServerForm({
  onCreated,
  onError,
}: {
  onCreated: (id: string) => void;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [serverName, setServerName] = useState("");
  const [openedOn, setOpenedOn] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Input
          value={serverName}
          onChange={(event) => setServerName(event.target.value)}
          placeholder="Tên server"
        />
        <Input
          type="date"
          value={openedOn}
          onChange={(event) => setOpenedOn(event.target.value)}
        />
        <Button
          type="button"
          onClick={async () => {
            try {
              const id = await createServer(serverName, openedOn);
              onCreated(id);
              setServerName("");
              router.refresh();
            } catch (err) {
              onError(err instanceof Error ? err.message : "Lỗi");
            }
          }}
        >
          Thêm server
        </Button>
      </CardContent>
    </Card>
  );
}
