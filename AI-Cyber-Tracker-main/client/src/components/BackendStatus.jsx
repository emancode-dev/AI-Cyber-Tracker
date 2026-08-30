import { useEffect, useState } from "react";
import Loader from "./Loader";
import { getHealth } from "../services/api";

function BackendStatus() {
  const [status, setStatus] = useState("checking");
  useEffect(() => {
    let active = true;
    getHealth().then(() => active && setStatus("online")).catch(() => active && setStatus("offline"));
    return () => { active = false; };
  }, []);
  if (status === "checking") return <Loader label="Checking API..." compact />;
  return <span className={`api-status api-status-${status}`}>● {status === "online" ? "Express API connected" : "Express API offline"}</span>;
}
export default BackendStatus;
