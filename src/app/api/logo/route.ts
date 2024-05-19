import { load } from 'cheerio'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    if (url != null && url !== '') {
        const response = await fetch(url)
        const text = await response.text()
        let $ = load(text)
        const script = $("#__NEXT_DATA__").html()
        if (script == null) {
            return Response.json({
                error: "No script found in response"
            });
        }
        const logoIndex = script.lastIndexOf("logoUrl")
        const commaIndex = script.indexOf(",", logoIndex)
        const logoUrl = script.substring(logoIndex, commaIndex).replaceAll('"', '').replaceAll('logoUrl:', '')
        const image = await fetch(logoUrl)
        const imageText = await image.text()
        $ = load(imageText)
        $('[fill]').each(function () {
            $(this).attr('fill', '#fff')
        })
        const content = $('svg').parent().html()
        return new Response(content, {
            headers: {
                'Content-Type': 'image/svg+xml'
            }
        })
    }
    return Response.json({
        error: "No url provided"
    });
}