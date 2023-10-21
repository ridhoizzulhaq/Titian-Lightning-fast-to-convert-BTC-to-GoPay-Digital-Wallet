const passport = require("passport");
const lnurlAuth = require("passport-lnurl-auth");
const session = require("express-session");
const { HttpError, verifyAuthorizationSignature } = require("lnurl/lib");
const crypto = require("crypto");
const lnurl = require("lnurl");
const qrcode = require("qrcode");

const map = {
  user: new Map(),
  session: new Map(),
};

function setupAuth(app) {
  app.use(
    session({
      secret: "12345",
      resave: false,
      saveUninitialized: true,
    })
  );

  passport.use(
    new lnurlAuth.Strategy(function (linkingPublicKey, done) {
      let user = map.user.get(linkingPublicKey);
      if (!user) {
        user = { id: linkingPublicKey };
        map.user.set(linkingPublicKey, user);
      }
      done(null, user);
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
  app.use(passport.authenticate("lnurl-auth"));
  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    done(null, map.user.get(id) || null);
  });

  app.get("/do-login", async function (req, res) {
    if (req.query.k1 && req.query.key && req.query.sig) {
      let session = map.session.get(req.query.k1);
      if (!session) {
        return res.status(400).send("Secret does not match any known session");
      }
      const { k1, sig, key } = req.query;
      if (!verifyAuthorizationSignature(sig, k1, key)) {
        return res.status(400).send("Invalid signature");
      }
      session.lnurlAuth = session.lnurlAuth || {};
      session.lnurlAuth.linkingPublicKey = req.query.key;
      await session.save();
      return res.status(200).json({ status: "OK" });
    }

    req.session = req.session || {};
    req.session.lnurlAuth = req.session.lnurlAuth || {};
    let k1 = req.session.lnurlAuth.k1 || generateSecret(32, "hex");
    if (!k1) {
      k1 = req.session.lnurlAuth.k1 = generateSecret(32, "hex");
      map.session.set(k1, req.session);
    }

    const params = new URLSearchParams({
      k1,
      tag: "login"
    });

    const callbackUrl = `https://${req.get("host")}/do-login?${params.toString()}`;
    const encoded = lnurl.encode(callbackUrl).toUpperCase();
    const qrCode = await qrcode.toDataURL(encoded);

    return res.json({
      lnurl: encoded,
      qrCode: qrCode,
    });
  });

  app.get("/logout", function (req, res) {
    if (req.user) {
      req.session.destroy();
      return res.redirect("/");
    }
  });

  app.get("/me", function (req, res) {
    res.json({ user: req.user ? req.user : null });
  });

  app.get("/profile", function (req, res) {
    if (!req.user) {
      return res.redirect("/login");
    }
    res.render("profile", { user: req.user });
  });
}

const generateSecret = function (numBytes, encoding) {
  numBytes = numBytes || 32;
  encoding = encoding || "hex";
  return crypto.randomBytes(numBytes).toString(encoding);
};

module.exports = { setupAuth: setupAuth };
