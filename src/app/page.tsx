"use client"

import React, {useCallback, useEffect, useRef} from 'react';
import localFont from 'next/font/local'

const halyardDisplayRegular = localFont({src: './HalyardDisplay-Regular.otf'})
const halyardDisplayMedium = localFont({src: './HalyardDisplay-Medium.otf'})
const halyardTextLight = localFont({src: './HalyardText-Light.otf'})

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [url, setUrl] = React.useState<string>('');
    const [logoFile, setLogoFile] = React.useState<FileList | null>(null);
    const [mainHeading, setMainHeading] = React.useState<string>('');
    const [subHeading, setSubHeading] = React.useState<string>('');
    const [image, setImage] = React.useState<FileList | null>(null);
    const [adSize, setAdSize] = React.useState<number>(0);
    const [bottomImageScale, setBottomImageScale] = React.useState<{ scaleX: number, scaleY: number }>({
        scaleX: 1,
        scaleY: 1
    });
    const [aspectRatio, setAspectRatio] = React.useState<{ enabled: boolean, ratio: number | string }>({
        enabled: false,
        ratio: 1
    });
    const bottomImageDimensionsRef = useRef({width: 1200, height: 1200});
    const adSizes = [{
        name: '1200x1200',
        width: 1200,
        height: 1200,
        byHeadoutLogoConfig: {
            distanceFromLeft: 200,
            scaleX: 0.5,
            scaleY: 0.5
        },
        config: {
            logoConfig: {
                distanceFromTop: 78,
                distanceFromLeft: 78,
                scaleX: 2,
                scaleY: 2
            },
            distanceFromLogo: 96,
            mainFontSize: 75,
            mainLetterSpacing: 0.8,
            mainLineHeight: 1.13 * 75,
            distanceBetweenSubAndMain: 24,
            subFontSize: 48,
            subLineHeight: 1.2 * 48,
            subLetterSpacing: -0.6,
            buttonDistanceFromTop: 80,
            buttonFontSize: 51,
            buttonWidth: 322,
            buttonHeight: 121,
            distances: {
                mainFromTop: 320,
                subFromTop: 400,
                buttonFromTop: 500
            }
        }
    }, {
        name: '1200x628',
        width: 1200,
        height: 628,
        byHeadoutLogoConfig: {
            distanceFromLeft: 120,
            scaleX: 0.3,
            scaleY: 0.3
        },
        config: {
            logoConfig: {
                distanceFromTop: 64,
                distanceFromLeft: 78,
                scaleX: 1,
                scaleY: 1
            },
            distanceFromLogo: 48,
            mainFontSize: 60,
            mainLetterSpacing: 0.7,
            mainLineHeight: 72,
            distanceBetweenSubAndMain: 16,
            subFontSize: 28.2,
            subLineHeight: 1.2 * 28.2,
            subLetterSpacing: 0,
            buttonDistanceFromTop: 42,
            buttonFontSize: 31.25,
            buttonWidth: 198.5,
            buttonHeight: 75.5,
            distances: {
                mainFromTop: 200,
                subFromTop: 270,
                buttonFromTop: 300
            }
        }
    }, {
        name: '1080x1920',
        width: 1080,
        height: 1920,
        byHeadoutLogoConfig: {
            distanceFromLeft: 195,
            scaleX: 0.5,
            scaleY: 0.5
        },
        config: {
            logoConfig: {
                distanceFromTop: 280,
                distanceFromLeft: 64,
                scaleX: 2,
                scaleY: 2
            },
            distanceFromLogo: 73,
            mainFontSize: 90,
            mainLetterSpacing: 1.22,
            mainLineHeight: 99,
            distanceBetweenSubAndMain: 24.37,
            subFontSize: 48.74,
            subLineHeight: 1.2 * 48,
            subLetterSpacing: -0.81,
            buttonDistanceFromTop: 79.2,
            buttonFontSize: 54,
            buttonWidth: 388,
            buttonHeight: 129,
            distances: {
                mainFromTop: 520,
                subFromTop: 610,
                buttonFromTop: 830
            }
        }
    }]
    const [canvasSize, setCanvasSize] = React.useState<{
        height: number,
        width: number
    }>({height: adSizes[adSize].height, width: adSizes[adSize].width});

    const verifyForm = useCallback(() => {
        // either url or logoFile must be filled in
        if ((url == null || url === '') && (logoFile == null || logoFile?.length === 0)) {
            alert("Please fill either logo url or add a logo file");
            return false;
        }
        if (!mainHeading || !subHeading) {
            alert("Please fill in all fields");
            return false;
        }
        if (mainHeading === '' || subHeading === '') {
            alert("Please fill both heading and subheading");
            return false;
        }
        return true;
    }, [url, mainHeading, subHeading, logoFile]);

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
        const buttonX = adSizes[adSize].config.logoConfig.distanceFromLeft;
        const buttonY = fromTop + 100;
        const buttonWidth = adSizes[adSize].config.buttonWidth;
        const buttonHeight = adSizes[adSize].config.buttonHeight;
        const buttonText = "Book now";
        const textColor = "#444444";
        const buttonColor = "white";
        const buttonRadius = 21;
        ctx.fillStyle = buttonColor;
        ctx.letterSpacing = '2px'
        drawRoundedRect(ctx, buttonX, buttonY, buttonWidth, buttonHeight, buttonRadius);
        ctx.fill();

        // Draw button text
        ctx.fillStyle = textColor;
        ctx.font = `${adSizes[adSize].config.buttonFontSize}px ${halyardDisplayRegular.style.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(buttonText, buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        ctx.restore()
    }, [drawRoundedRect, adSize])

    const drawSubHeading = useCallback((fromTop: number) => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        const lines = subHeading.split('\n')
        ctx.font = `300 ${adSizes[adSize].config.subFontSize}px ${halyardTextLight.style.fontFamily}`
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.letterSpacing = `${adSizes[adSize].config.subLetterSpacing}px`
        const lineHeight = adSizes[adSize].config.subLineHeight;
        let index = 0;
        for (const line of lines) {
            ctx.fillText(line, adSizes[adSize].config.logoConfig.distanceFromLeft, fromTop + (index * lineHeight));
            index++;
        }
        drawButton((index - 1) * lineHeight + adSizes[adSize].config.distances.buttonFromTop)
    }, [subHeading, drawButton, adSize]);

    const drawMainHeading = useCallback(() => {
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        ctx.font = `${adSizes[adSize].config.mainFontSize}px ${halyardDisplayMedium.style.fontFamily}`
        ctx.fillStyle = "#fff";
        ctx.letterSpacing = `${adSizes[adSize].config.mainLetterSpacing}px`
        let lines = mainHeading.split('\n')
        let lineHeight = adSizes[adSize].config.mainLineHeight;
        let index = 0;
        for (const line of lines) {
            ctx.fillText(line, adSizes[adSize].config.logoConfig.distanceFromLeft, adSizes[adSize].config.distances.mainFromTop + (index * lineHeight));
            index++;
        }
        drawSubHeading((index - 1) * lineHeight + adSizes[adSize].config.distances.subFromTop)
    }, [mainHeading, drawSubHeading, adSize])

    const drawBottomImage = useCallback(() => {
        if (image == null || image.length === 0) {
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(image![0]);
        reader.onload = (ev) => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;
            const img = new Image();
            img.onload = function () {
                const x = canvas.width - bottomImageScale.scaleX * img.width;
                const y = canvas.height - bottomImageScale.scaleY * img.height;
                bottomImageDimensionsRef.current.width = img.width;
                bottomImageDimensionsRef.current.height = img.height;
                ctx.drawImage(img, x, y, bottomImageScale.scaleX * img.width, bottomImageScale.scaleY * img.height);
            }
            img.src = ev.target!.result as string;
        }
    }, [image, bottomImageScale.scaleX, bottomImageScale.scaleY]);

    const handlePreview = useCallback(async () => {
        if (!verifyForm()) {
            return;
        }
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext('2d')!;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (logoFile != null && logoFile.length > 0) {
            const url = URL.createObjectURL(logoFile[0]);
            const logo = new Image();
            logo.src = url;
            logo.onload = () => {
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d')!;
                context.globalCompositeOperation = "source-over";
                context.drawImage(logo, adSizes[adSize].config.logoConfig.distanceFromLeft, adSizes[adSize].config.logoConfig.distanceFromTop, logo.width, logo.height);
            };
        } else {
            const logoPath = `/api/logo?url=${encodeURIComponent(url)}`
            const logo = new Image();
            logo.src = logoPath;
            logo.onload = () => {
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d')!;
                context.globalCompositeOperation = "source-over";
                context.drawImage(logo, adSizes[adSize].config.logoConfig.distanceFromLeft, adSizes[adSize].config.logoConfig.distanceFromTop, adSizes[adSize].config.logoConfig.scaleX * logo.width, adSizes[adSize].config.logoConfig.scaleY * logo.height);
            };
            const byHeadoutLogo = new Image();
            byHeadoutLogo.src = "/hog.png";
            byHeadoutLogo.onload = () => {
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d')!;
                context.globalCompositeOperation = "source-over";
                context.drawImage(byHeadoutLogo, adSizes[adSize].byHeadoutLogoConfig.distanceFromLeft + adSizes[adSize].byHeadoutLogoConfig.distanceFromLeft, adSizes[adSize].config.logoConfig.distanceFromTop, byHeadoutLogo.width * adSizes[adSize].byHeadoutLogoConfig.scaleX,byHeadoutLogo.height*adSizes[adSize].byHeadoutLogoConfig.scaleY);
            };
        }
        requestAnimationFrame(drawBackground)
        requestAnimationFrame(drawMainHeading)
        requestAnimationFrame(drawBottomImage)
    }, [url, verifyForm, drawBackground, drawMainHeading, drawBottomImage, logoFile, adSize]);

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
                <h1 className="text-3xl font-bold">Headout Ad Creator</h1>
                {/*Add a select box for choosing size from 1200x1200 or 1200x968*/}
                <div>
                    <label htmlFor="imageSize" className="block text-sm font-medium text-gray-300">Ad Size</label>
                    <select value={adSize} onChange={e => {
                        const value = Number(e.target.value)
                        setAdSize(value)
                        const size = adSizes[value]
                        setCanvasSize({height: size.height, width: size.width})
                        canvasRef.current!.width = size.width
                        canvasRef.current!.height = size.height
                    }} id="imageSize"
                            className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded">
                        {adSizes.map(({name, width, height}, index) => <option key={name}
                                                                               value={index}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-gray-300">Logo URL (Auto
                        extracted)</label>
                    <input value={url} onChange={e => setUrl(e.target.value)} type="text" id="url"
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           placeholder="Enter URL"/>
                </div>
                <div className="flex justify-center">
                    <div>
                        OR
                    </div>
                </div>
                <div>
                    <label htmlFor="logo-file" className="block text-sm font-medium text-gray-300">Upload
                        Logo (Takes precedence over URL)</label>
                    <input type="file" id="logo-file"
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           onChange={e => setLogoFile(e.target.files)} accept="image/*"/>
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
                    <label htmlFor="image-upload" className="block text-sm font-medium text-gray-300">Bottom
                        Image</label>
                    <input type="file" id="image-upload" onChange={e => setImage(e.target.files)}
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           accept="image/*"/>
                </div>
                <div>
                    {/*Need an option to specify aspect ratio and a checkbox to enable*/}
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Aspect
                        Ratio</label>
                    <input type="text" id="aspect-ratio"
                           value={aspectRatio.ratio}
                           onChange={e => setAspectRatio(p => ({
                                   ...p,
                                   ratio: e.target.value
                               }
                           ))}
                           className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"
                           placeholder="Aspect Ratio"/>
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium text-gray-300">Enable
                        Aspect
                        Ratio</label>
                    <input type="checkbox" id="aspect-ratio"
                           checked={aspectRatio.enabled}
                           onChange={e => setAspectRatio(p => ({
                               ...p,
                               enabled: e.target.checked
                           }))}
                    />
                </div>
                <div>
                    <label htmlFor="background-upload" className="block text-sm font-medium text-gray-300">Bottom Image
                        Scale</label>
                    {/*Two range inputs for scaleX and scaleY*/}
                    <div className="flex gap-2">
                        <input type="range" id="scaleX"
                               value={bottomImageScale.scaleX}
                               min={0}
                               max={4}
                               step={0.1}
                               onChange={e => {
                                   if (aspectRatio.enabled) {
                                       setBottomImageScale({
                                           ...bottomImageScale,
                                           scaleX: Number(e.target.value),
                                           scaleY: Number(e.target.value) * Number(aspectRatio.ratio)
                                       })
                                   } else {
                                       setBottomImageScale({...bottomImageScale, scaleX: Number(e.target.value)})
                                   }
                                   handlePreview().catch(console.error)
                               }}
                               className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"/>
                        <input type="range" id="scaleY"
                               value={bottomImageScale.scaleY}
                               min={0}
                               max={4}
                               step={0.1}
                               onChange={e => {
                                   if (aspectRatio.enabled) {
                                       setBottomImageScale({
                                           ...bottomImageScale,
                                           scaleY: Number(e.target.value),
                                           scaleX: Number(e.target.value) / Number(aspectRatio.ratio)
                                       })
                                   } else {
                                       setBottomImageScale({...bottomImageScale, scaleY: Number(e.target.value)})
                                   }
                                   handlePreview().catch(console.error)
                               }}
                               className="mt-1 block w-full p-2 bg-gray-800 border border-gray-700 rounded"/>
                    </div>

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
                <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
                        className="max-w-full max-h-full border-2 border-green-600"></canvas>
            </div>
        </div>
    );
}
