"use client";
import { DataTable } from "@/components/data-table";
import data from "./data.json";
import useAuthStore from "@/lib/store/authStore";

export default function Page() {
  const { user } = useAuthStore();

  console.log("user", user);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col">
          <div className="flex flex-col gap-4">
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}
