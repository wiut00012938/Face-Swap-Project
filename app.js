/*let fs = require('fs')
const express = require('express');
const path = require('path')
const app = express();*/
import dotenv from 'dotenv'
import fs from 'fs'
import express from 'express'
import path from 'path'
const app = express();

dotenv.config();
let PORT = process.env.PORT || 3000;
//const bodyParser = require('body-parser');
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use('/static', express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.post("/setImages", (req,res) => {
    const {swap, target} = req.body;
    setImages(swap, target);
    res.send("Images set successfully.");
})

app.get("/generateImage", async (req, res) => {
    await generateImage();
    res.send("Image generation initiated.");
})

app.get("/getGeneratedImageUrl", (req, res)=> {
    res.json(getGeneratedImageUrl())
})

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(PORT, error => {
    if(error) throw error
    console.log(`App is available via http://localhost:${PORT}`)
})

import Replicate from "replicate"
const replicate = new Replicate({
    auth: process.env.Replicate_API_TOKEN,
});

let swapImage;
let targetImage;
let generatedImageUrl;

export function setImages(swap, target){
    swapImage = swap;
    targetImage = target;
}

export function getGeneratedImageUrl(){
    return generatedImageUrl;
}

export async function generateImage(){
    if (!swapImage || !targetImage){
        console.error("Swap and target images are required.")
        return;
    }
    const inputParams = {
        input: {
            swap_image: swapImage,
            target_image: targetImage,
        }
    };
    try {
        const output = await replicate.run(
            "omniedgeio/face-swap:c2d783366e8d32e6e82c40682fab6b4c23b9c6eff2692c0cf7585fc16c238cfe",
            inputParams
        );
        generatedImageUrl = output;
    }
    catch(error){
        console.error("error generating image:", error);
    }
}

import multer from 'multer'
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  // Handle image upload and save it to the 'static/images' directory
  const imageDataBuffer = req.file.buffer;
  const photoName = 'photo_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + '.png';
  const filePath = path.join(__dirname, 'public', 'images', photoName);

  // Write the buffer to the file
  fs.writeFileSync(filePath, imageDataBuffer);

  res.json({ success: true, imagePath: `/static/images/${photoName}` });
});

app.delete('/deletePhoto', (req, res) => {
    const photoUrl = req.body.url;
    const photoPath = path.join(__dirname, 'public', 'images', path.basename(photoUrl));

    // Delete the photo on the server
    fs.unlink(photoPath, (err) => {
        if (err) {
            console.error('Error deleting photo:', err);
            res.status(500).json({ success: false, error: 'Failed to delete photo on the server' });
        } else {
            console.log('Photo deleted successfully on the server');
            res.json({ success: true });
        }
    });
});
