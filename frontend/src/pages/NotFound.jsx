import React from "react";
export default function NotFound(){
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h1 className="text-3xl font-semibold">Page not found</h1>
        <p className="text-muted mt-2">Return to dashboard</p>
      </div>
    </div>
  );
}
