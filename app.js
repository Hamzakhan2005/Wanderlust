if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { stat } = require("fs");
const { wrap } = require("module");
const { listingSchema, reviewSchema } = require("./schema.js");
const { valid } = require("joi");
const Review = require("./models/review.js");
const listingsRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const dburl = process.env.ATLASDB_URL;
main()
  .then(() => console.log("connected to DB"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dburl);
}

const store = MongoStore.create({
  mongoUrl: dburl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("error in mongo session store", err);
});
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.get("/demouser", async (req, res) => {
  let fakeUser = new User({
    email: "studenid@gmail.com",
    username: "hamza_p2",
  });

  let registeredUser = await User.register(fakeUser, "password");
  res.send(registeredUser);
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// app.get("/", (req, res) => {
//   res.send("working");
// });

app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not Found"));
});

// MIDDLEWARES
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went Wrong" } = err;

  res.status(status).render("error.ejs", { message });
});

app.listen(8080, () => {
  console.log("app listening");
});

// app.get("/testlisting", async (req, res) => {
//   let sampleListing = new Listing({
//     title: "New Villa",
//     description: "By The Beach",
//     price: 24000000,
//     location: "Calangute,Goa",
//     country: "India",
//   });
//   await sampleListing.save();
//   console.log("saved");
//   res.send("success");
// });
