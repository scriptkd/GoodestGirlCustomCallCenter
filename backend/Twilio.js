const twilio = require("twilio");
const AccessToken = require("twilio/lib/jwt/AccessToken");
const VoiceResponse = require("twilio/lib/twiml/VoiceResponse");

class Twilio {
  phoneNumber = "+1 480-566-9373";
  phoneNumberSid = "PN244f6c41946b202436c11be8e3c94f00";
  tokenSid = "SK11bcbb42189e83a479fe5b0bc5940f8c";
  tokenSecret = "Ttuc9OBvfEu7ohKbknVlDvI03wDmNQoT";
  accountSid = "AC48dd19d5e084157dac77687227028eb8";
  verify = "VAbc97017eeb8149c68bcf29b41e427351";
  sashaLineSid = "AP515b2374eb85eb209de0e69bf875e34a";
  client;
  constructor() {
    this.client = twilio(this.tokenSid, this.tokenSecret, {
      accountSid: this.accountSid,
    });
  }
  getTwilio() {
    this.client;
  }

  async sendVerify(to, channel) {
    const data = await this.client.verify
      .services(this.verify)
      .verifications.create({
        to,
        channel,
      });
    return data;
  }

  async verifyCode(to, code) {
    const data = await this.client.verify
      .services(this.verify)
      .verificationChecks.create({
        to,
        code,
      });
    console.log("verifyCode", data);
    return data;
  }

  voiceResponse(message) {
    const twiml = new VoiceResponse();
    twiml.say(
      {
        voice: "Polly.Brian",
      },
      message
    );
    twiml.redirect("https://sashaline.loca.lt/enq");
    return twiml;
  }

  enqueueCall(enqName) {
    const twiml = new VoiceResponse();
    twiml.enqueue(enqName);
    return twiml;
  }

  endCall(sid) {
    const twiml = new VoiceResponse();
    twiml.hangup(sid);
    this.client.calls(sid).update({
      url: "https://sashaline.loca.lt/end-call",
      method: "post",
      function(err, call) {
        console.log(call);
        if (err) {
          console.error(err);
        }
      },
    });
    return twiml;
  }

  redirectCall(client) {
    const twiml = new VoiceResponse();
    twiml.dial().client(client);
    return twiml;
  }

  answerCall(sid) {
    console.log("Answering Call:", sid);
    this.client.calls(sid).update({
      url: "https://sashaline.loca.lt/connect-call",
      method: "post",
      function(err, call) {
        console.log(call);
        if (err) {
          console.error(err);
        }
      },
    });
  }

  getTokenForVoice = (identity) => {
    console.log(`Token for ${identity}`);
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;
    const sashaSid = this.sashaLineSid;
    const voiceGrant = new VoiceGrant({
      sashaLineSid: sashaSid,
      incomingAllow: true,
    });

    const token = new AccessToken(
      this.accountSid,
      this.tokenSid,
      this.tokenSecret,
      { identity }
    );
    token.addGrant(voiceGrant);
    console.log("Access Granted with JWT", token.toJwt());
    return token.toJwt();
  };
}

const instance = new Twilio();
Object.freeze(instance);

module.exports = instance;
