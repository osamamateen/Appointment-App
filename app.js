const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/appointmentApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser());
app.use(methodOverride("_method"));

const sessionSchema = {
  name: String,
  contact: Number,
  date: { type: Date },
  time: String,
};

const Session = mongoose.model("Session", sessionSchema);

app.get("/", (req, res) => {
  res.send("hey");
});

app.get("/sessions", (req, res) => {
  Session.find({})
    .sort({ date: +1 })
    .exec((err, sessions) => {
      if (err) {
        console.log(err);
      } else {
        res.render("sessions", { sessions: sessions });
      }
    });
});

app.get("/sessions/new", (req, res) => {
  res.render("new", { alert: false });
});

app.post("/sessions", (req, res) => {
  const myDate = new Date(req.body.date);
  const date = myDate.setDate(myDate.getDate() + 1);
  const name = req.body.name;
  const contact = req.body.contact;
  const time = req.body.time;
  const newSession = {
    name: name,
    date: date,
    time: time,
    contact: contact,
  };

  Session.findOne(
    { $and: [{ date: date }, { time: time }] },
    (err, session) => {
      if (err) {
        console.log(err);
      } else {
        if (session) {
          res.render("new", { alert: true });
          console.log("Existing session: " + session);
        } else {
          Session.create(newSession, (err, newlyCreated) => {
            if (err) {
              console.log(err);
            } else {
              console.log(newlyCreated);
              res.redirect("/sessions");
            }
          });
        }
      }
    }
  );
});

app.delete("/sessions/:id", (req, res) => {
  Session.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      console.log(req.params.id);
      res.redirect("/sessions");
    } else {
      res.redirect("/sessions");
    }
  });
});

app.listen(3000, () => {
  console.log("listening on port 3000");
});
