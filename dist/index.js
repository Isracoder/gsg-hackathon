import express from "express";
// import {  } from "aws-sdk/clients/iot.js";
// import "aws-sdk";
import info from "./info.js";
// import Rekognition from "aws-sdk";
// import "aws-sdk";
import AWS from "aws-sdk";
import multer from "multer";
import fs from "fs";
const app = express();
app.use(express.json());
// var AWS = require("aws-sdk");
import "reflect-metadata";
import db from "./db/index.js";
import { Image } from "./db/entities/Image.js";
const storage = multer.memoryStorage();
const PORT = process.env.PORT || 3000;
AWS.config.update({
    accessKeyId: info.aws_access_key,
    secretAccessKey: info.aws_secret_access_key,
    region: info.region,
});
const reco = new AWS.Rekognition();
// app.use(express.static("public"));
app.set("view engine", "ejs"); // Set EJS as the view engine
// // ... (Your previous configuration code)
// // Render the HTML template
app.get("/", (req, res) => {
    const dynamicData = ["analyze", "celebs", "findText"]; // Replace with your data
    res.render("ind", { dynamicData }); // Pass data to the template
    // res.render("./views/index");
    // res.render("ind");
});
// app.get("/", (req, res) => {
//   res.send("Server UP!");
// });
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: diskStorage });
app.post("/celebs", 
// Upload.single("file"),
upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    const imageBuffer = req.file.buffer;
    const fileUrl = req.file.destination + "/" + req.file.filename;
    console.log(`The url is : ${fileUrl}`);
    console.log(`${req.file.destination} ${req.file.filename}`);
    const fileBuffer = fs.readFileSync(fileUrl);
    const params = {
        Image: {
            Bytes: fileBuffer,
        },
    };
    let picData = [fileUrl];
    // res.render("pic", { picData });
    reco.recognizeCelebrities(params, async (err, data) => {
        if (err) {
            console.error("Error analyzing image:", err);
            return res.status(500).json({ message: "Error analyzing image" });
        }
        console.log("faces detected:", data.CelebrityFaces);
        const newImageReco = new Image();
        newImageReco.type = "celebs";
        newImageReco.url = fileUrl;
        newImageReco.result = JSON.stringify(data);
        await newImageReco.save();
        // Save the JSON result to a file (optional)
        fs.writeFileSync("result.json", JSON.stringify(data, null, 2));
        res.json({ img: fileUrl, ...data });
    });
});
app.post("/findText", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    const imageBuffer = req.file.buffer;
    const fileUrl = req.file.destination + "/" + req.file.filename;
    // console.log(`The url is : ${fileUrl}`);
    // console.log(`${req.file.destination} ${req.file.filename}`);
    const fileBuffer = fs.readFileSync(fileUrl);
    const params = {
        Image: {
            Bytes: fileBuffer,
        },
    };
    reco.detectText(params, async (err, data) => {
        if (err) {
            console.error("Error analyzing image:", err);
            return res.status(500).json({ message: "Error analyzing image" });
        }
        console.log("text detected:", data.TextDetections);
        const newImageReco = new Image();
        newImageReco.type = "findText";
        newImageReco.url = fileUrl;
        newImageReco.result = JSON.stringify(data);
        await newImageReco.save();
        // Save the JSON result to a file (optional)
        // fs.writeFileSync("result.json", JSON.stringify(data, null, 2));
        res.json(data);
    });
});
// Define a route for uploading an image and analyzing it
app.post("/analyze", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    const imageBuffer = req.file.buffer;
    const fileUrl = req.file.destination + "/" + req.file.filename;
    console.log(`The url is : ${fileUrl}`);
    console.log(`${req.file.destination} ${req.file.filename}`);
    const fileBuffer = fs.readFileSync(fileUrl);
    const params = {
        Image: {
            Bytes: fileBuffer,
        },
    };
    reco.detectLabels(params, async (err, data) => {
        if (err) {
            console.error("Error analyzing image:", err);
            return res.status(500).json({ message: "Error analyzing image" });
        }
        console.log("Labels detected:", data.Labels);
        const newImageReco = new Image();
        newImageReco.type = "identify";
        newImageReco.url = fileUrl;
        newImageReco.result = JSON.stringify(data);
        await newImageReco.save();
        // Save the JSON result to a file (optional)
        // fs.writeFileSync("result.json", JSON.stringify(data, null, 2));
        res.json(data);
    });
});
app.post("/identify", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    const imageBuffer = req.file.buffer;
    const params = {
        Image: {
            Bytes: imageBuffer,
        },
    };
    reco.detectLabels(params, async (err, data) => {
        if (err) {
            console.error("Error analyzing image:", err);
            return res.status(500).json({ message: "Error analyzing image" });
        }
        console.log("Labels detected:", data.Labels);
        const newImageReco = new Image();
        newImageReco.type = "identify";
        newImageReco.url = "";
        newImageReco.result = JSON.stringify(data);
        await newImageReco.save();
        // Save the JSON result to a file (optional)
        // fs.writeFileSync("result.json", JSON.stringify(data, null, 2));
        res.json(data);
        res.send(data);
    });
});
app.use((req, res) => {
    res.status(404).send("You requested something I don't have :(");
});
app.listen(PORT, () => {
    console.log(`App is running and Listening on port ${PORT}`);
    db.initialize();
});
