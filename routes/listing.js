const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listing.js");

router
  .route("/")
  //INDEX ROUTE
  .get(wrapAsync(listingController.index))
  //CREATE ROUTE
  .post(
    isLoggedIn,
    // validateListing,
    upload.single("Listing[image]"),
    wrapAsync(listingController.createListing)
  );

//NEW ROUTE
router.get("/new", isLoggedIn, listingController.newForm);

router
  .route("/:id")
  //SHOW ROUTE
  .get(wrapAsync(listingController.showListing))
  //UPDATE ROUTE
  .put(
    isLoggedIn,
    isOwner,
    upload.single("Listing[image]"),
    validateListing,
    wrapAsync(listingController.updateListing)
  )
  //DELETE ROUTE
  .delete(isLoggedIn, isOwner, wrapAsync(listingController.deleteListing));

//EDIT ROUTE
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;
