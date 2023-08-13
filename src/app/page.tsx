"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; // Import useState
import { useAppDataContext } from "@/context/store";

export default function Homepage(): JSX.Element {
  const router = useRouter();
  const { defaultTab } = useAppDataContext();

  const [show404, setShow404] = useState(false); // Add state for 404 rendering

  useEffect(() => {
    if (defaultTab) {
      router.push(`/${defaultTab}`);
    } else {
      setShow404(true); // Set show404 state to true
    }
  }, [defaultTab, router]);

  return (
    <div>
      {show404 ? ( // Conditionally render based on show404 state
        <div>
          <h1>404 not found.</h1>
        </div>
      ) : (
        <div>Redirecting...</div>
      )}
    </div>
  );
}
