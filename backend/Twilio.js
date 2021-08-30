const twilio = require("twilio");
const AccessToken = require("twilio/lib/jwt/AccessToken");
const VoiceResponse = require("twilio/lib/twiml/VoiceResponse");

class Twilio {
  phoneNumber = "+1 480-566-9373";
  phoneNumberSid = "Phone SID here!";
  tokenSid = "token SID here!";
  tokenSecret = "Whatever your Token is Here!";
  accountSid = "Whatever your SID is Here";
  verify = "Verify Code Here!";
  sashaLineSid = "Whatever your Line SID is Here!";
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
