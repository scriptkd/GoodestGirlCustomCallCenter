import React, { useEffect, useState } from "react";
import Login from "./components/Login.js";
import { useImmer } from "use-immer";
import axios from "./utils/axios.js";
import socket from "./utils/SocketIo.js";
import CallCenter from "./components/callCenter.js";
import useTokenFromLocalStorage from "./hooks/useTokenFromLocalStorage.js";
import * as Twilio from "twilio-client";

function App() {
  const [calls, setCalls] = useImmer({
    calls: [],
  });
  const [user, setUser] = useImmer({
    username: "",
    mobileNumber: "",
    verificationCode: "",
    verificationSent: false,
  });

  const [twilioToken, setTwilioToken] = useState();

  const [storedToken, setStoredToken, isValidToken] =
    useTokenFromLocalStorage(null);

  useEffect(() => {
    console.log("Twilio Token Changed");
    if (twilioToken) {
      connectVoiceClient(twilioToken);
    }
  }, [twilioToken]);

  useEffect(() => {
    console.log("Accepted Token!");
    if (isValidToken) {
      socket.addToken(storedToken);
    } else {
      console.log("Invalid Token!");
      socket.removeToken();
    }
  }, [isValidToken, storedToken]);

  useEffect(() => {
    socket.client.on("connect", () => {
      console.log("Socket Connected!");
    });
    socket.client.on("disconnect", () => {
      console.log("Socket Disconnected!");
    });
    socket.client.on("twilio-token", (data) => {
      console.log("Received Token from Server!");
      setTwilioToken(data.token);
    });
    socket.client.on("call-new", ({data: {CallSid, CallStatus, Direction, From, FromState, FromCountry}}) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex(
          (call) => call.CallSid === CallSid
        );
        console.log(index);
        console.log("Data from current Call: ", CallSid);
        if (index === -1) {
          draft.calls.push({CallSid, CallStatus, Direction, From, FromState, FromCountry});
        }
        console.log("Data from our calls Array: ", calls);
      });
    });
    socket.client.on("enq", ({data: {CallSid}}) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex(
          // eslint-disable-next-line no-self-compare
          ({ CallSid }) => CallSid === CallSid
        );
        console.log(index);
        if (index === -1) {
          return;
        }
        draft.calls[index].CallStatus = "enqueue";
      });
    });
    socket.client.on("answer-call", ({data: {CallSid}}) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex(
          // eslint-disable-next-line no-self-compare
          ({ CallSid }) => CallSid === CallSid
        );
        draft.calls[index].CallStatus = "in-progress";
      });
    });
    socket.client.on("end-call", ({data: {CallSid}}) => {
      setCalls((draft) => {
        const index = draft.calls.findIndex(
          // eslint-disable-next-line no-self-compare
          ({ CallSid }) => CallSid === CallSid
        );
        draft.calls[index].CallStatus = "complete";
      });
    });
    return () => {};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket.client]);

  function connectVoiceClient(twilioToken) {
    const device = new Twilio.Device(twilioToken, { debug: true });
    device.on("error", (error) => {
      console.log(error);
    });

    device.on("incoming", (connection) => {
      console.log("Incoming from Twilio");
      connection.accept();
    });
  }

  async function sendSmsCode() {
    console.log(`Sending SMS...`);
    await axios.post("/login", {
      to: `+1 ${user.mobileNumber}`,
      username: user.username,
      channel: "sms",
    });
    setUser((draft) => {
      draft.verificationSent = true;
    });
    console.log("Code Sent!");
  }
  async function sendCode() {
    console.log("Sending Code to Server...");
    let response = await axios.post("/verify", {
      to: `+1 ${user.mobileNumber}`,
      code: user.verificationCode,
      username: user.username,
    });
    console.log("Code Retrieved!");
    console.log("Recieved token ", response.data.token);
    setStoredToken(response.data.token);
  }
  return (
    <div>
      {isValidToken ? (
        <CallCenter calls={calls} />
      ) : (
        <>
          <Login
            user={user}
            setUser={setUser}
            sendSmsCode={sendSmsCode}
            sendCode={sendCode}
          />
        </>
      )}
    </div>
  );
}

export default App;
