import { useEffect, useState } from "react";
import axios from "../utils/axios";
import useLocalStorage from "./useLocalStorage";

function useTokenFromLocalStorage(initalValue) {
  const [value, setValue] = useLocalStorage("token", initalValue);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateToken();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  async function validateToken() {
    const { data } = await axios.post("/validate-token", { token: value });
    console.log("Validate Token ? : ", data);
    setIsValid(data.isValid);
  }
  return [value, setValue, isValid];
}

export default useTokenFromLocalStorage;