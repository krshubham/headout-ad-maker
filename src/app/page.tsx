"use client"

import React, {useCallback, useRef} from 'react';
import localFont from 'next/font/local'

const halyardDisplayRegular = localFont({src: './HalyardDisplay-Regular.otf'})
const halyardDisplayMedium = localFont({src: './HalyardDisplay-Medium.otf'})
const halyardTextLight = localFont({src: './HalyardText-Light.otf'})

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [url, setUrl] = React.useState<string>('');
    const [mainHeading, setMainHeading] = React.useState<string>('');
    const [subHeading, setSubHeading] = React.useState<string>('');
    const [image, setImage] = React.useState<FileList | null>(null);

    const verifyForm = useCallback(() => {
        console.log({
            url,
            mainHeading,
            subHeading,
            image
        })
        if (!url || !mainHeading || !subHeading || !image) {
            alert("Please fill in all fields");
            console.log(false);
            return false;
        }
        if (url === '' || mainHeading === '' || subHeading === '' || image.length === 0) {
            alert("Please fill in all fields");
            console.log(false);
            return false;
        }
        return true;
    }, [url, mainHeading, subHeading, image]);

    const drawBackground = useCallback(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "destination-over"
        const gradient = ctx.createLinearGradient(-1, -1, canvas.width, canvas.height);
        gradient.addColorStop(0, '#8C2DEC');  // Start color
        gradient.addColorStop(1, '#5602AA');  // End color

        ctx.rect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = gradient;
        ctx.fill()
    }, []);

    const drawRoundedRect = useCallback((ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }, []);

    const drawButton = useCallback((fromTop: number) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.save();
        const buttonX = 78;
        const buttonY = fromTop + 100;
        const buttonWidth = 322;
        const buttonHeight = 122;
        const buttonText = "Book now";
        const textColor = "#444444";
        const buttonColor = "white";
        const borderColor = "black";
        const buttonRadius = 21;
        ctx.fillStyle = buttonColor;
        ctx.letterSpacing = '2px'
        drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
        ctx.fill();

        // Draw button border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
        ctx.stroke();

        // Draw button text
        ctx.fillStyle = textColor;
        ctx.font = `50px ${halyardDisplayRegular.style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        ctx.restore()
    }, [drawRoundedRect])

    const drawSubHeading = useCallback((fromTop: number) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        const lines = subHeading.split('\n')
        ctx.font = `300 48px ${halyardTextLight.style.fontFamily}`
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.letterSpacing = '-0.6px'
        const lineHeight = 58;
        let index = 0;
        for(const line of lines) {
            ctx.fillText(line, 78, fromTop + (index * lineHeight));
            index++;
        }
        drawButton((index-1) * lineHeight + fromTop)
    }, [subHeading, drawButton]);

    const drawMainHeading = useCallback(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        ctx.font = `92px ${halyardDisplayMedium.style.fontFamily}`
        ctx.fillStyle = "#fff";
        ctx.letterSpacing = '0.8px'
        let lines = mainHeading.split('\n')
        let lineHeight = 104;
        let index = 0;
        for(const line of lines) {
            ctx.fillText(line, 78, 320 + (index * lineHeight));
            index++;
        }
        drawSubHeading((index-1) * lineHeight + 400)
    }, [mainHeading, drawSubHeading])

    const drawBottomImage = useCallback(() => {
        const reader = new FileReader();
        reader.readAsDataURL(image![0]);
        reader.onload = (ev) => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            img.onload = function(){
                const x = canvas.width - img.width;
                const y = canvas.height - img.height;
                ctx.drawImage(img, x, y);
            }
            img.src = ev.target!.result as string;
        }
    }, [image]);

    const handlePreview = useCallback(async () => {
        if (!verifyForm()) {
            return;
        }
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Implement your preview logic here
        const logoPath = `/api/logo?url=${encodeURIComponent(url)}`
        const logo = new Image();
        logo.src = logoPath;
        logo.onload = () => {
            const canvas = canvasRef.current!;
            const context = canvas.getContext('2d')!;
            context.globalCompositeOperation = "source-over";
            context.drawImage(logo, 78, 78, 2*logo.width, 2*logo.height);
        };
        requestAnimationFrame(drawBackground)
        requestAnimationFrame(drawMainHeading)
        requestAnimationFrame(drawBottomImage)
    }, [url, verifyForm, drawBackground, drawMainHeading, drawBottomImage]);

    const handleDownload = () => {
        const canvas = canvasRef.current!;
        const url = canvas!.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'headout-ad.png';
        link.click();
    };

    return (
        <div className="flex flex-col md:flex-row h-screen bg-black text-white">
            <div className="w-full md:w-1/3 p-4 bg-gray-900 flex flex-col gap-4">
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300">URL</label>
                    <input value={url} onChange={e => setUrl(e.target.value)} type="text" id="url"
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           placeholder="Enter URL"/>
                </div>
                <div>
                    <label htmlFor="main-heading" className="block text-sm font-medium text-gray-300">Main
                        Heading</label>
                    <textarea id="main-heading"
                              value={mainHeading}
                              onChange={e => setMainHeading(e.target.value)}
                              className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                              placeholder="Main Heading"></textarea>
                </div>
                <div>
                    <label htmlFor="sub-heading" className="block text-sm font-medium text-gray-300">Sub Heading</label>
                    <input type="text" id="sub-heading"
                           value={subHeading}
                           onChange={e => setSubHeading(e.target.value)}
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           placeholder="Sub Heading"/>
                </div>
                <div>
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300">Logo</label>
                    <input type="file" id="image-upload" onChange={e => setImage(e.target.files)} className="mt-1 block w-full text-gray-400" accept="image/*"/>
                </div>
                <div className="flex gap-2">
                    <button onClick={handlePreview}
                            className="w-full py-2 bg-green-600 hover:bg-green-500 rounded">Preview
                    </button>
                    <button onClick={handleDownload}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded">Download
                    </button>
                </div>
            </div>
            <div className="w-full md:w-2/3 flex justify-center items-center bg-gray-800 p-4">
                <canvas ref={canvasRef} width="1200" height="1200"
                        className="max-w-full max-h-full border-2 border-green-600"></canvas>
            </div>
        </div>
    );
}
