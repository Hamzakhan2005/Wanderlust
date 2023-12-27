const Listing = require("../models/listing.js");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find({});
  res.render("./listings/index.ejs", { alllistings });
};

module.exports.newForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Your listing does not exist");
    res.redirect("/listings");
  }

  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  // let { title, description, image, price, location, country } = req.body;
  // let listing = req.body;
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send Valid Data");
  // }

  let coordinate = await geocodingClient
    .forwardGeocode({
      query: req.body.Listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.Listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = coordinate.body.features[0].geometry;

  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created");
  res.redirect("./listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Your listing does not exist");
    return res.redirect("/listings");
  }

  let originalUrl = listing.image.url;
  originalUrl = originalUrl.replace("/upload", "/upload/h_250,w_250");
  res.render("./listings/edit.ejs", { listing, originalUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.Listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
