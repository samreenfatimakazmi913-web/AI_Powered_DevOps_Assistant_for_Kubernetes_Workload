// src/pages/JobDetail.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export default function JobDetail() {
  const { name } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Button onClick={() => navigate(-1)}>⬅ Back</Button>
      <h1 className="text-2xl font-bold">{name}</h1>

      <Card>
        <div className="text-sm">Namespace: production</div>
        <div className="text-sm mt-1">Status: Running</div>
        <div className="text-sm mt-1">Duration: 2m 15s</div>
        <div className="text-sm mt-1">Progress: 2/5 completions</div>
      </Card>

      <Card>
        <h2 className="font-bold mb-2">Logs</h2>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md h-64 overflow-auto text-sm font-mono">
          {/* Dummy logs */}
          Pod started...
          <br />
          Job running...
          <br />
          Step 2 completed...
          <br />
          ...
        </div>
      </Card>
    </div>
  );
}
