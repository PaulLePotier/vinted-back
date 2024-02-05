const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// const uid2 = require("uid2");
// const SHA256 = require("crypto-js/sha256");
// const encBase64 = require("crypto-js/enc-base64");
const app = express();
// const router = express.Router();

// SPECIFIQUE A OFFRE A METTRE DANS LA ROUTE OFFER
const cloudinary = require("cloudinary");
const fileUpload = require("express-fileupload");
const isAuthenticated = require("./middleware/isAuthenticated");
// SPECIFIQUE A OFFRE A METTRE DANS LA ROUTE OFFER
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/Vinted");

// SPECIFIQUE A OFFRE A METTRE DANS LA ROUTE OFFER
const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};
// SPECIFIQUE A OFFRE A METTRE DANS LA ROUTE OFFER

const Offer = mongoose.model("Offer", {
  product_name: String,
  product_description: String,
  product_price: Number,
  product_details: Array,
  product_image: Object,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

// module.exports = Offer;
// app.post("/offer/publish", isAuthenticated, fileUpload(), async (req, res) => {
app.post("/offer/publish", fileUpload(), async (req, res) => {
  try {
    // récupérer les fichiers avec req.files
    // console.log("files =>", req.files.picture);
    // console.log("body =>", req.body);
    // {
    //   title: 'pantalon',
    //   description: 'presque neuf',
    //   price: '5',
    //   condition: 'neuf',
    //   city: 'Paris',
    //   brand: 'H&M',
    //   size: 'L',
    //   color: 'rouge'
    // }

    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    // créer le document correspondant à l'offre
    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        {
          MARQUE: brand,
        },
        {
          TAILLE: size,
        },
        {
          ÉTAT: condition,
        },
        {
          COULEUR: color,
        },
        {
          EMPLACEMENT: city,
        },
      ],
      owner: req.user,
    });
    console.log("newOffer =>", newOffer);
    // envoyer l'image à cloudinary
    if (req.files) {
      const convertedPicture = convertToBase64(req.files.picture);
      // console.log(convertedPicture);
      const uploadResult = await cloudinary.uploader.upload(convertedPicture, {
        folder: `/vinted/offers/${newOffer._id}`,
      });
      // console.log(uploadResult);
      // inclure l'image dans notre nouveau document (donc l'offre)
      newOffer.product_image = uploadResult;
    }

    console.log(newOffer);
    // sauvegardera l'offre
    await newOffer.save();
    return res.status(201).json(newOffer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.get("/", (req, res) => {
  return res.json("server is ready");
});

const userRoutes = require("./routes/user");
app.use(userRoutes);

app.all("*", (req, res) => {
  return res.status(404).json("not found");
});

app.listen(3000, () => {
  console.log("server started");
});
