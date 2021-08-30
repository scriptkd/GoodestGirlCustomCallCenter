import React from "react";
import { Container, Step } from "semantic-ui-react";
import socket from "../utils/SocketIo";
import { Button, Form, Checkbox } from "semantic-ui-react";

function CallProgress({ call }) {
  function answerCall(sid) {
    socket.client.emit("answer-call", { sid });
  }
  function endCall(sid) {
    socket.client.emit("end-call", { sid });
  }
  return (
    <Container>
      <Step.Group widths={4}>
        <Step
          icon="phone"
          title="Ringing"
          description={
           call.Direction +
            " call from " +
            call.From +
            " | " +
            call.FromState +
            ", " +
            call.FromCountry  
          }
          active={call.CallStatus === "ringing"}
          completed={call.CallStatus !== "ringing"}
        />
        <Step
          icon="cogs"
          title="In Queue"
          description="Customer In Queue"
          active={call.CallStatus === "enqueue"}
          disabled={call.CallStatus === "ringing"}
          completed={
            call.CallStatus === "in-progress" ||
            call.CallStatus === "complete"
          }
        />
        <Step
          icon="headphones"
          title="On Call"
          description="Speaking with Jimmie"
          disabled={
            call.CallStatus === "ringing" ||
            call.CallStatus === "enqueue"
          }
          active={call.CallStatus === "in-progress"}
          completed={call.CallStatus === "complete"}
        />
        <Step
          icon="times"
          title="End Call"
          description="Call Ended"
          disabled={call.CallStatus !== "complete"}
          completed={call.CallStatus === "complete"}
        />
      </Step.Group>
      <Button.Group fluid>
        <Button primary onClick={() => answerCall(call.CallSid)}>
          Answer Call
        </Button>
        <Button secondary onClick={() => endCall(call.CallSid)}>
          End Call
        </Button>
        <Button>Resolve Call</Button>
      </Button.Group>
      {(call.CallStatus === "in-progress" && 
        <Form>
          <Form.Field>
            <label>Client Name:</label>
            <input />
          </Form.Field>
          <Form.Field>
            <label>Date:</label>
            <input type="date" />
          </Form.Field>
          <Form.Field>
            <label>Notes:</label>
            <textarea />
          </Form.Field>
          <Form.Field>
            <Checkbox label="I agree that Sasha is the Goodest Girl." />
          </Form.Field>
          <Button.Group>
            <Button positive type="submit">
              Submit Notes
            </Button>
            <Button.Or/>
            <Button negative>
              Delete Notes
            </Button>
          </Button.Group>
        </Form>
      )}
    </Container>
  );
}

export default CallProgress;
