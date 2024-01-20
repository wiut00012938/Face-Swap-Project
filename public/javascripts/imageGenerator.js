//import Replicate  from "replicate";
/*const Replicate = require('replicate')
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
        generatedImageUrl = output.generated_image.url;
    }
    catch(error){
        console.error("error generating image:", error);
    }
}*/