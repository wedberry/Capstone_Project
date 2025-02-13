import React, { useEffect, useState } from "react";
import axios from "axios";

function TrainerHome() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/trainers/dashboard/")
      .then((response) => setMessage(response.data.message))
      .catch((error) => console.error("Error:", error));
  }, []);

  return <h1>{message}</h1>;
}

export default TrainerHome;
